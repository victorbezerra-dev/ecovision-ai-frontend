export interface TypeCount {
  [type: string]: number;
}

export interface ClusterStats {
  center: [number, number];         
  total_points: number;
  by_type: TypeCount;          
  dates: string[];                  
}



