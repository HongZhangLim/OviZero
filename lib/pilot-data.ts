export type Risk = "Critical" | "High" | "Elevated" | "Watch";

export type NodeData = {
  id: string;
  location: string;
  latitude: number;
  longitude: number;
  score: number;
  risk: Risk;
  eggs: number;
  growth: number;
  temp: number;
  humidity: number;
  battery: number;
  signal: "Strong" | "Medium" | "Weak";
};

// Illustrative coordinates for a simulated Klang Valley PPR pilot. They do not
// represent deployed hardware or validated surveillance coverage.
export const pilotNodes: NodeData[] = [
  { id: "OZ-001", location: "North residential block", latitude: 3.0845, longitude: 101.7380, score: 91, risk: "Critical", eggs: 127, growth: 37, temp: 32.1, humidity: 84, battery: 93, signal: "Strong" },
  { id: "OZ-002", location: "Market drain corridor", latitude: 3.0839, longitude: 101.7371, score: 87, risk: "Critical", eggs: 116, growth: 33, temp: 31.8, humidity: 82, battery: 78, signal: "Strong" },
  { id: "OZ-003", location: "Community courtyard", latitude: 3.0838, longitude: 101.7390, score: 82, risk: "High", eggs: 108, growth: 29, temp: 31.5, humidity: 80, battery: 66, signal: "Medium" },
  { id: "OZ-004", location: "School perimeter", latitude: 3.0830, longitude: 101.7375, score: 78, risk: "High", eggs: 96, growth: 27, temp: 31.2, humidity: 79, battery: 85, signal: "Strong" },
  { id: "OZ-005", location: "Riverside apartments", latitude: 3.0827, longitude: 101.7388, score: 74, risk: "High", eggs: 88, growth: 24, temp: 30.9, humidity: 78, battery: 52, signal: "Medium" },
  { id: "OZ-006", location: "Transit plaza", latitude: 3.0824, longitude: 101.7368, score: 69, risk: "Elevated", eggs: 76, growth: 20, temp: 30.6, humidity: 76, battery: 71, signal: "Strong" },
  { id: "OZ-007", location: "Community park", latitude: 3.0819, longitude: 101.7380, score: 63, risk: "Elevated", eggs: 68, growth: 16, temp: 30.4, humidity: 74, battery: 47, signal: "Weak" },
  { id: "OZ-008", location: "South residential block", latitude: 3.0818, longitude: 101.7392, score: 58, risk: "Elevated", eggs: 57, growth: 12, temp: 30.1, humidity: 72, battery: 89, signal: "Strong" },
  { id: "OZ-009", location: "Sports complex", latitude: 3.0829, longitude: 101.7400, score: 52, risk: "Watch", eggs: 45, growth: 8, temp: 29.8, humidity: 70, battery: 61, signal: "Medium" },
  { id: "OZ-010", location: "Market square", latitude: 3.0840, longitude: 101.7402, score: 46, risk: "Watch", eggs: 38, growth: 5, temp: 29.6, humidity: 68, battery: 76, signal: "Strong" },
];

export const proposedGateway = {
  id: "GW-01",
  latitude: 3.0850,
  longitude: 101.7395,
} as const;
