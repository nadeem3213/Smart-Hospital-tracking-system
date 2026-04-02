import { hospitalData, AMBULANCE_POSITION } from "@/data/hospitals";
import type { Hospital } from "@/data/hospitals";

export interface GraphNode {
  id: string;
  lat: number;
  lng: number;
  label?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight: number;
}

export type TrafficLevel = "low" | "moderate" | "heavy";

export interface RouteSegment {
  from: [number, number];
  to: [number, number];
  fromId: string;
  toId: string;
  distance: number;
  trafficLevel: TrafficLevel;
}

export interface RouteResult {
  path: [number, number][];
  distance: number;
  eta: number;
  nodes: string[];
  segments: RouteSegment[];
  overallTraffic: TrafficLevel;
  routeLabel: string;
  color: string;
}

const TRAFFIC_MULTIPLIERS: Record<TrafficLevel, number> = {
  low: 1.0,
  moderate: 1.8,
  heavy: 3.0,
};

const TRAFFIC_COLORS: Record<TrafficLevel, string> = {
  low: "#22c55e",
  moderate: "#eab308",
  heavy: "#ef4444",
};

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function getEdgeTraffic(fromId: string, toId: string): TrafficLevel {
  const key = [fromId, toId].sort().join("-");
  const hash = simpleHash(key) % 10;
  if (hash <= 5) return "low";
  if (hash <= 8) return "moderate";
  return "heavy";
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const BASE_WAYPOINTS: GraphNode[] = [
  ...hospitalData.map((h) => ({ id: h.name, lat: h.lat, lng: h.lng, label: h.name })),
  { id: "jn1", lat: 18.5250, lng: 73.8520, label: "Junction 1" },
  { id: "jn2", lat: 18.5280, lng: 73.8400, label: "Junction 2" },
  { id: "jn3", lat: 18.5150, lng: 73.8300, label: "Junction 3" },
  { id: "jn4", lat: 18.5100, lng: 73.8500, label: "Junction 4" },
  { id: "jn5", lat: 18.5400, lng: 73.8550, label: "Junction 5" },
  { id: "jn6", lat: 18.5350, lng: 73.8700, label: "Junction 6" },
  { id: "jn7", lat: 18.5500, lng: 73.8200, label: "Junction 7" },
  { id: "jn8", lat: 18.5450, lng: 73.8900, label: "Junction 8" },
  { id: "jn9", lat: 18.4950, lng: 73.8550, label: "Junction 9" },
  { id: "jn10", lat: 18.5550, lng: 73.8600, label: "Junction 10" },
  { id: "jn11", lat: 18.5200, lng: 73.8150, label: "Junction 11" },
  { id: "jn12", lat: 18.5600, lng: 73.8450, label: "Junction 12" },
];

const BASE_CONNECTIONS: [string, string][] = [
  ["jn1", "jn2"],
  ["jn1", "jn5"],
  ["jn1", "jn6"],
  ["jn2", "jn3"],
  ["jn2", "City General Hospital"],
  ["jn2", "jn7"],
  ["jn3", "jn11"],
  ["jn3", "Fortis Emergency Wing"],
  ["jn4", "jn9"],
  ["jn4", "Fortis Emergency Wing"],
  ["jn4", "jn3"],
  ["jn5", "City General Hospital"],
  ["jn5", "jn6"],
  ["jn5", "jn12"],
  ["jn6", "jn8"],
  ["jn6", "jn10"],
  ["jn7", "Metro Trauma Institute"],
  ["jn7", "jn12"],
  ["jn8", "Govt. District Hospital"],
  ["jn8", "jn10"],
  ["jn9", "St. Mary's Hospital"],
  ["jn9", "jn4"],
  ["jn10", "Govt. District Hospital"],
  ["jn10", "jn12"],
  ["jn11", "Apollo Medical Center"],
  ["jn11", "jn7"],
  ["jn12", "Metro Trauma Institute"],
  ["jn12", "jn10"],
];

function getWaypoints(userPosition: [number, number]): GraphNode[] {
  return [
    { id: "user", lat: userPosition[0], lng: userPosition[1], label: "Your Location" },
    ...BASE_WAYPOINTS,
  ];
}

function getNearestJunctions(userLat: number, userLng: number, count: number): string[] {
  const junctions = BASE_WAYPOINTS.filter((w) => w.id.startsWith("jn"));
  const sorted = junctions
    .map((j) => ({ id: j.id, dist: haversineDistance(userLat, userLng, j.lat, j.lng) }))
    .sort((a, b) => a.dist - b.dist);
  return sorted.slice(0, count).map((j) => j.id);
}

function buildGraph(
  userPosition: [number, number],
  edgePenalties?: Map<string, number>
): Map<string, Map<string, number>> {
  const waypoints = getWaypoints(userPosition);
  const nodeMap = new Map<string, GraphNode>();
  for (const node of waypoints) {
    nodeMap.set(node.id, node);
  }

  const graph = new Map<string, Map<string, number>>();
  for (const node of waypoints) {
    graph.set(node.id, new Map());
  }

  const nearestJunctions = getNearestJunctions(userPosition[0], userPosition[1], 4);
  const userConnections: [string, string][] = nearestJunctions.map((jn) => ["user", jn]);
  const allConnections = [...BASE_CONNECTIONS, ...userConnections];

  for (const [fromId, toId] of allConnections) {
    const from = nodeMap.get(fromId);
    const to = nodeMap.get(toId);
    if (!from || !to) continue;

    let dist = haversineDistance(from.lat, from.lng, to.lat, to.lng);

    if (edgePenalties) {
      const edgeKey = [fromId, toId].sort().join("|");
      const penalty = edgePenalties.get(edgeKey);
      if (penalty) {
        dist *= penalty;
      }
    }

    graph.get(fromId)!.set(toId, dist);
    graph.get(toId)!.set(fromId, dist);
  }

  return graph;
}

function runDijkstra(
  graph: Map<string, Map<string, number>>,
  sourceId: string,
  targetId: string
): { distance: number; nodeIds: string[] } | null {
  if (!graph.has(sourceId) || !graph.has(targetId)) return null;

  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const visited = new Set<string>();
  const queue: { id: string; dist: number }[] = [];

  for (const nodeId of graph.keys()) {
    distances.set(nodeId, Infinity);
    previous.set(nodeId, null);
  }

  distances.set(sourceId, 0);
  queue.push({ id: sourceId, dist: 0 });

  while (queue.length > 0) {
    queue.sort((a, b) => a.dist - b.dist);
    const current = queue.shift()!;

    if (visited.has(current.id)) continue;
    visited.add(current.id);

    if (current.id === targetId) break;

    const neighbors = graph.get(current.id);
    if (!neighbors) continue;

    for (const [neighborId, weight] of neighbors) {
      if (visited.has(neighborId)) continue;

      const newDist = distances.get(current.id)! + weight;
      if (newDist < distances.get(neighborId)!) {
        distances.set(neighborId, newDist);
        previous.set(neighborId, current.id);
        queue.push({ id: neighborId, dist: newDist });
      }
    }
  }

  if (distances.get(targetId) === Infinity) return null;

  const nodeIds: string[] = [];
  let current: string | null = targetId;
  while (current !== null) {
    nodeIds.unshift(current);
    current = previous.get(current) ?? null;
  }

  return { distance: distances.get(targetId)!, nodeIds };
}

function buildRouteResult(
  graphNodeIds: string[],
  displayNodeIds: string[],
  totalDistance: number,
  waypoints: GraphNode[],
  label: string
): RouteResult {
  const nodeMap = new Map<string, GraphNode>();
  for (const node of waypoints) {
    nodeMap.set(node.id, node);
  }

  const path: [number, number][] = graphNodeIds
    .map((id) => {
      const node = nodeMap.get(id);
      return node ? ([node.lat, node.lng] as [number, number]) : null;
    })
    .filter((p): p is [number, number] => p !== null);

  const segments: RouteSegment[] = [];
  let totalEtaMinutes = 0;
  const avgSpeedKmh = 40;

  for (let i = 0; i < graphNodeIds.length - 1; i++) {
    const fromNode = nodeMap.get(graphNodeIds[i]);
    const toNode = nodeMap.get(graphNodeIds[i + 1]);
    if (!fromNode || !toNode) continue;

    const segDist = haversineDistance(fromNode.lat, fromNode.lng, toNode.lat, toNode.lng);
    const traffic = getEdgeTraffic(graphNodeIds[i], graphNodeIds[i + 1]);
    const segEta = (segDist / avgSpeedKmh) * 60 * TRAFFIC_MULTIPLIERS[traffic];
    totalEtaMinutes += segEta;

    segments.push({
      from: [fromNode.lat, fromNode.lng],
      to: [toNode.lat, toNode.lng],
      fromId: displayNodeIds[i],
      toId: displayNodeIds[i + 1],
      distance: Math.round(segDist * 100) / 100,
      trafficLevel: traffic,
    });
  }

  const trafficCounts = { low: 0, moderate: 0, heavy: 0 };
  for (const seg of segments) {
    trafficCounts[seg.trafficLevel]++;
  }

  let overallTraffic: TrafficLevel = "low";
  if (trafficCounts.heavy > segments.length * 0.3) {
    overallTraffic = "heavy";
  } else if (trafficCounts.moderate + trafficCounts.heavy > segments.length * 0.4) {
    overallTraffic = "moderate";
  }

  return {
    path,
    distance: Math.round(totalDistance * 100) / 100,
    eta: Math.round(totalEtaMinutes * 10) / 10,
    nodes: displayNodeIds,
    segments,
    overallTraffic,
    routeLabel: label,
    color: TRAFFIC_COLORS[overallTraffic],
  };
}

export function dijkstra(
  sourceId: string,
  targetId: string,
  userPosition?: [number, number]
): RouteResult | null {
  const pos = userPosition ?? AMBULANCE_POSITION;
  const effectiveSource = sourceId === "amb" ? "user" : sourceId;
  const graph = buildGraph(pos);
  const waypoints = getWaypoints(pos);

  const result = runDijkstra(graph, effectiveSource, targetId);
  if (!result) return null;

  const displayNodes = result.nodeIds.map((id) => (id === "user" ? "amb" : id));
  return buildRouteResult(result.nodeIds, displayNodes, result.distance, waypoints, "Fastest Route");
}

export function findMultipleRoutes(
  targetId: string,
  userPosition?: [number, number],
  count: number = 3
): RouteResult[] {
  const pos = userPosition ?? AMBULANCE_POSITION;
  const routes: RouteResult[] = [];
  const seenPaths = new Set<string>();
  const cumulativePenalties = new Map<string, number>();

  const labels = ["Fastest Route", "Alternative Route", "Scenic Route"];

  for (let i = 0; i < count; i++) {
    const graph = buildGraph(pos, i === 0 ? undefined : cumulativePenalties);
    const waypoints = getWaypoints(pos);
    const result = runDijkstra(graph, "user", targetId);
    if (!result) continue;

    const pathKey = result.nodeIds.join(",");
    if (seenPaths.has(pathKey)) continue;
    seenPaths.add(pathKey);

    const displayNodes = result.nodeIds.map((id) => (id === "user" ? "amb" : id));

    const unpenaledGraph = buildGraph(pos);
    let realDistance = 0;
    for (let j = 0; j < result.nodeIds.length - 1; j++) {
      const neighbors = unpenaledGraph.get(result.nodeIds[j]);
      if (neighbors) {
        const edgeDist = neighbors.get(result.nodeIds[j + 1]);
        if (edgeDist !== undefined) {
          realDistance += edgeDist;
        }
      }
    }

    const routeResult = buildRouteResult(result.nodeIds, displayNodes, realDistance, waypoints, labels[i] ?? `Route ${i + 1}`);
    routes.push(routeResult);

    for (let j = 0; j < result.nodeIds.length - 1; j++) {
      const edgeKey = [result.nodeIds[j], result.nodeIds[j + 1]].sort().join("|");
      cumulativePenalties.set(edgeKey, (cumulativePenalties.get(edgeKey) ?? 1) * 3);
    }
  }

  routes.sort((a, b) => a.eta - b.eta);

  if (routes.length > 0) routes[0].routeLabel = "Fastest Route";
  if (routes.length > 1) routes[1].routeLabel = "Alternative Route";
  if (routes.length > 2) routes[2].routeLabel = "Scenic Route";

  return routes;
}

export function findBestHospital(
  userPosition?: [number, number]
): { hospital: Hospital; route: RouteResult } | null {
  let bestRoute: RouteResult | null = null;
  let bestHospital: Hospital | null = null;
  let bestScore = Infinity;

  for (const hospital of hospitalData) {
    if (hospital.status === "critical" && hospital.icuBeds === 0) continue;

    const route = dijkstra("amb", hospital.name, userPosition);
    if (!route) continue;

    const statusPenalty = hospital.status === "critical" ? 5 : hospital.status === "busy" ? 2 : 0;
    const bedBonus = hospital.icuBeds > 3 ? -1 : hospital.icuBeds === 0 ? 3 : 0;
    const score = route.distance + statusPenalty + bedBonus;

    if (score < bestScore) {
      bestScore = score;
      bestRoute = route;
      bestHospital = hospital;
    }
  }

  if (!bestRoute || !bestHospital) return null;
  return { hospital: bestHospital, route: bestRoute };
}

export { haversineDistance, TRAFFIC_COLORS, AMBULANCE_POSITION };
