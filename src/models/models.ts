export enum TiposVista {
  Jornadas,
  Pagos,
  Estadisticas,
  Rachas,
  CaraACara,
  ManagerMes,
  Historico,
  Historico2526,
}

export interface Jornada {
  id?: number;
  numeroJornada: number;
  idJugador: number;
  puntos: number;
  pago: number;
  posicion: number;
}

export interface Jugador {
  id: number;
  nombre: string;
  apodo: string;
  puntos: number;
  descripcion: string;
  imagen?: string;
  pagos?: number;
}

export enum Apodos {
  Fognini = "Fognini",
  Steven = "Steven",
  Butchlivar = "Butchlivar",
  CarniceroDeMondragon = "Carnicero de mondragon",
  Acierillo = "Acierillo",
  ElManito = "El manito",
  Mitxi = "Mitxi",
  Fresnhel = "Fresnhel",
  Dennis = "Dennis",
  AnthonyGORDON = "Anthony GORDON",
  Deiviiss = "Deiviiss",
  Polfovich = "Polfovich",
}
