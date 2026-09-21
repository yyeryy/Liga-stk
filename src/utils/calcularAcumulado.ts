import { data } from "../data/data.ts";
import { Apodos } from "../models/models.ts";

export type JugadorPago = {
  jugador: Apodos;
  puntos: number;
  pago: number;
  posicion: number;
};

// Sistema de pagos para 10 jugadores activo actualmente:
// Posiciones 1-4: 0€
// Posiciones 5-10: importes progresivos en saltos de 0,50€.
// Con 38 jornadas (7 dobles y la última triple), la media teórica queda en
// 61,10€ por jugador, la aproximación más cercana a 60€ con importes lineales.
const pagos10: Record<number, number> = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 1,
  6: 1.5,
  7: 2,
  8: 2.5,
  9: 3,
  10: 3.5,
};

// Tabla conservada para el formato de 12 jugadores.
export const pagos12: Record<number, number> = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0.5,
  6: 1,
  7: 1.5,
  8: 2,
  9: 2.5,
  10: 3,
  11: 3.5,
  12: 4,
};

const getPagosPorPosicion = (_numJornada: number, numeroJugadores = 10) =>
  numeroJugadores > 10 ? pagos12 : pagos10;

/**
 * Calcula puntos y pagos acumulados de los jugadores en un rango de jornadas.
 */
export const calcularAcumulado = (
  desde: number,
  hasta: number,
  esEstadistica?: boolean,
  incluirCompensaciones = false,
): JugadorPago[] => {
  const todosJugadores = Object.values(Apodos);

  const altasPorJugador: Partial<Record<Apodos, number>> = {
    [Apodos.Deiviiss]: 6,
    [Apodos.Polfovich]: 7,
  };

  const jugadoresFiltrados = todosJugadores.filter(
    (jugador) => (altasPorJugador[jugador] ?? 1) <= hasta,
  );

  const acumulado: Record<string, JugadorPago> = {};
  jugadoresFiltrados.forEach((j) => {
    acumulado[j] = { jugador: j, puntos: 0, pago: 0, posicion: 0 };
  });

  const jornadasDelRango = data.jornadas.filter(
    (j) => j.numero >= desde && j.numero <= hasta,
  );

  jornadasDelRango.forEach((jornada) => {
    const resultados = Array.isArray(jornada.resultados)
      ? [...jornada.resultados].sort((a, b) => b.puntos - a.puntos)
      : [];

    if (resultados.length === 0) return;

    const pagosPos = getPagosPorPosicion(jornada.numero, resultados.length);

    // Factor:
    // - Jornadas múltiplos de 5 -> doble (x2).
    // - La última jornada -> triple (x3) ONLY si la temporada completa tiene 38 jornadas.
    const numeros = data.jornadas.map((x) => x.numero);
    const maxNumero = numeros.length ? Math.max(...numeros) : 38;
    const isMultipleOf5 = jornada.numero % 5 === 0;
    const isSeasonComplete38 = maxNumero === 38;
    let factor = 1;
    if (isMultipleOf5) factor = 2;
    else if (jornada.numero === maxNumero && isSeasonComplete38) factor = 3;

    const conPosiciones = resultados
      .map((r, idx) => {
        if (!r) return null;
        return { ...r, posicion: idx + 1 };
      })
      .filter(
        (r): r is { jugador: Apodos; puntos: number; posicion: number } => !!r,
      );

    conPosiciones.forEach((r) => {
      if (!acumulado[r.jugador]) return;

      const empatados = conPosiciones.filter((x) => x.puntos === r.puntos);
      const pagoBase = pagosPos[r.posicion] || 0;
      const pago =
        empatados.length > 1
          ? (empatados.reduce(
              (acc, x) => acc + (pagosPos[x.posicion] || 0),
              0,
            ) /
              empatados.length) *
            factor
          : pagoBase * factor;

      acumulado[r.jugador].puntos += r.puntos;
      acumulado[r.jugador].pago += pago;
    });
  });

  if (incluirCompensaciones) {
    Object.entries(altasPorJugador).forEach(([jugador, alta]) => {
      if (!alta || !acumulado[jugador]) return;

      const jornadasAusencia = data.jornadas.filter(
        (jornada) =>
          jornada.numero >= desde &&
          jornada.numero < alta &&
          jornada.numero <= hasta,
      );

      jornadasAusencia.forEach((jornada) => {
        const resultados = [...jornada.resultados].sort(
          (a, b) => b.puntos - a.puntos,
        );
        if (resultados.length === 0) return;

        const pagosPos = getPagosPorPosicion(jornada.numero, resultados.length);
        const factor = jornada.numero % 5 === 0 ? 2 : 1;
        const pagosJornada = resultados.map((resultado, posicion) => {
          const empatados = resultados.filter(
            (otro) => otro.puntos === resultado.puntos,
          );
          const pagoBase = pagosPos[posicion + 1] || 0;
          return empatados.length > 1
            ? (empatados.reduce(
                (total, empate) =>
                  total + (pagosPos[resultados.indexOf(empate) + 1] || 0),
                0,
              ) /
                empatados.length) *
                factor
            : pagoBase * factor;
        });

        acumulado[jugador].pago +=
          pagosJornada.reduce((total, pago) => total + pago, 0) /
          pagosJornada.length;
      });
    });
  }

  // Calcular posiciones finales del rango
  const listaFinal = Object.values(acumulado).sort(
    (a, b) => b.puntos - a.puntos,
  );
  let lastPuntos: number | null = null;
  let lastPos = 0;
  listaFinal.forEach((j, idx) => {
    if (j.puntos === lastPuntos) {
      j.posicion = lastPos;
    } else {
      lastPos = idx + 1;
      lastPuntos = j.puntos;
      j.posicion = lastPos;
    }
  });

  return listaFinal;
};

// Devuelve el máximo de puntos por jugador en un rango de jornadas
export const obtenerMaximos = (): Record<Apodos, number> => {
  const maximos: Record<Apodos, number> = {} as Record<Apodos, number>;
  Object.values(Apodos).forEach((j) => (maximos[j] = 0));

  const jornadasDelRango = data.jornadas.filter(
    (j) => j.numero >= 1 && j.numero <= 38,
  );

  jornadasDelRango.forEach((jornada) => {
    if (!Array.isArray(jornada.resultados)) return;

    jornada.resultados.forEach((r) => {
      if (!r) return;
      maximos[r.jugador] = Math.max(maximos[r.jugador] ?? 0, r.puntos);
    });
  });

  return maximos;
};

// Devuelve el mínimo de puntos por jugador en un rango de jornadas
export const obtenerMinimos = (): Record<Apodos, number> => {
  const minimos: Record<Apodos, number> = {} as Record<Apodos, number>;
  Object.values(Apodos).forEach((j) => (minimos[j] = Infinity));

  const jornadasDelRango = data.jornadas.filter(
    (j) => j.numero >= 1 && j.numero <= 38,
  );

  jornadasDelRango.forEach((jornada) => {
    if (!Array.isArray(jornada.resultados)) return;

    jornada.resultados.forEach((r) => {
      if (!r) return;
      minimos[r.jugador] = Math.min(minimos[r.jugador] ?? Infinity, r.puntos);
    });
  });

  return minimos;
};

export const obtenerPromedios = (): Record<Apodos, number> => {
  const sumas: Record<Apodos, number> = {} as Record<Apodos, number>;
  const conteos: Record<Apodos, number> = {} as Record<Apodos, number>;

  Object.values(Apodos).forEach((j) => {
    sumas[j] = 0;
    conteos[j] = 0;
  });

  const jornadasDelRango = data.jornadas.filter(
    (j) => j.numero >= 1 && j.numero <= 38,
  );

  jornadasDelRango.forEach((jornada) => {
    if (!Array.isArray(jornada.resultados)) return;

    jornada.resultados.forEach((r) => {
      if (!r) return;
      sumas[r.jugador] += r.puntos;
      conteos[r.jugador] += 1;
    });
  });

  const promedios: Record<Apodos, number> = {} as Record<Apodos, number>;
  Object.values(Apodos).forEach((j) => {
    promedios[j] = conteos[j] > 0 ? sumas[j] / conteos[j] : 0;
  });

  return promedios;
};

export const vecesTop1 = (): Record<Apodos, number> => {
  const top1: Record<Apodos, number> = {} as Record<Apodos, number>;
  Object.values(Apodos).forEach((j) => (top1[j] = 0));

  data.jornadas.forEach((jornada) => {
    if (!Array.isArray(jornada.resultados) || jornada.resultados.length === 0)
      return;

    const resultados = [...jornada.resultados].sort(
      (a, b) => b.puntos - a.puntos,
    );

    // puntos máximos de la jornada
    const maxPuntos = resultados[0].puntos;
    // incrementa a todos los que tienen esos puntos (empate en 1º)
    resultados
      .filter((r) => r.puntos === maxPuntos)
      .forEach((r) => {
        top1[r.jugador]++;
      });
  });

  return top1;
};

// Veces en el top 3 (teniendo en cuenta empates)
export const vecesTop3 = (): Record<Apodos, number> => {
  const top3: Record<Apodos, number> = {} as Record<Apodos, number>;
  Object.values(Apodos).forEach((j) => (top3[j] = 0));

  data.jornadas.forEach((jornada) => {
    if (!Array.isArray(jornada.resultados) || jornada.resultados.length === 0)
      return;

    const resultados = [...jornada.resultados].sort(
      (a, b) => b.puntos - a.puntos,
    );

    // Asignamos posiciones con manejo de empates: si puntos iguales -> misma posición
    let lastPuntos: number | null = null;
    let lastPos = 0;
    resultados.forEach((r, idx) => {
      const posicion = r.puntos === lastPuntos ? lastPos : idx + 1;
      lastPuntos = r.puntos;
      lastPos = posicion;

      if (posicion <= 3) top3[r.jugador]++;
    });
  });

  return top3;
};

// Jornadas libradas (pagando 0)
export const jornadasLibradas = (): Record<Apodos, number> => {
  const libradas: Record<Apodos, number> = {} as Record<Apodos, number>;
  Object.values(Apodos).forEach((j) => (libradas[j] = 0));

  data.jornadas.forEach((jornada) => {
    if (!Array.isArray(jornada.resultados)) return;

    const pagosPos = getPagosPorPosicion(
      jornada.numero,
      jornada.resultados.length,
    );

    jornada.resultados.forEach((r, idx) => {
      if (!r) return;

      // obtener el pago real del jugador en esa jornada
      const pagoJugador = pagosPos[idx + 1] ?? 0; // idx +1 porque las posiciones empiezan en 1
      if (pagoJugador === 0) libradas[r.jugador]++;
    });
  });

  return libradas;
};
