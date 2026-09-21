import { useState, useEffect, useMemo } from "react";
import { calcularAcumulado, JugadorPago } from "../utils/calcularAcumulado.ts";
import { Apodos } from "../models/models.ts";
import "./pagos.css";
import CustomSelect from "./CustomSelect.tsx";

const pagosIniciales = {
  [Apodos.Deiviiss]: 8.5,
  [Apodos.Polfovich]: 10,
};

export const PagosPanel = () => {
  const [selectedBloque, setSelectedBloque] = useState(0);
  const [pagos, setPagos] = useState<JugadorPago[]>([]);

  const bloques = useMemo(
    () => [
      { id: 0, nombre: "General (Total)", desde: 1, hasta: 38 },
      { id: 1, nombre: "Jornadas 1-5", desde: 1, hasta: 5 },
      { id: 2, nombre: "Jornadas 6-10", desde: 6, hasta: 10 },
      { id: 3, nombre: "Jornadas 11-15", desde: 11, hasta: 15 },
      { id: 4, nombre: "Jornadas 16-20", desde: 16, hasta: 20 },
      { id: 5, nombre: "Jornadas 21-25", desde: 21, hasta: 25 },
      { id: 6, nombre: "Jornadas 26-30", desde: 26, hasta: 30 },
      { id: 7, nombre: "Jornadas 31-35", desde: 31, hasta: 35 },
      { id: 8, nombre: "Jornadas 36-38", desde: 36, hasta: 38 },
    ],
    [],
  );

  // We'll visualise medals and use a left red border proportional to the debt.

  const getMedal = (pos: number) => {
    if (pos === 1) return "🥇";
    if (pos === 2) return "🥈";
    if (pos === 3) return "🥉";
    return <span className="medal-text">{pos}º</span>;
  };

  useEffect(() => {
    const bloque = bloques.find((b) => b.id === selectedBloque);
    if (!bloque) return;
    const resultado = calcularAcumulado(
      bloque.desde,
      bloque.hasta,
      false,
      false,
    );
    if (bloque.id === 0) {
      resultado.find((j) => j.jugador === Apodos.Deiviiss)!.pago +=
        pagosIniciales[Apodos.Deiviiss];
      resultado.find((j) => j.jugador === Apodos.Polfovich)!.pago +=
        pagosIniciales[Apodos.Polfovich];
    }
    if (bloque.id === 1) {
      resultado.push(
        {
          jugador: Apodos.Deiviiss,
          puntos: 0,
          pago: pagosIniciales[Apodos.Deiviiss],
          posicion: 0,
        },
        {
          jugador: Apodos.Polfovich,
          puntos: 0,
          pago: pagosIniciales[Apodos.Polfovich],
          posicion: 0,
        },
      );
    }
    const resultadoOrdenado = [...resultado].sort((a, b) => a.pago - b.pago);

    let lastPago: number | null = null;
    let lastPos = 0;
    resultadoOrdenado.forEach((j, idx) => {
      if (j.pago === lastPago) {
        j.posicion = lastPos;
      } else {
        lastPos = idx + 1;
        lastPago = j.pago;
        j.posicion = lastPos;
      }
    });
    setPagos(resultadoOrdenado);
  }, [selectedBloque, bloques]);

  const maxPagoActual = Math.max(...pagos.map((p) => p.pago), 0);

  const pagosNoDisputado =
    pagos.length === 0 || pagos.every((p) => (p.puntos ?? 0) === 0);

  const formatEuros = (num: number) => {
    return num % 1 === 0 ? num : num.toFixed(2);
  };

  return (
    <div className="pagos-panel">
      <div className="panel panel-screen">
        <h2 className="h2">💸 Panel de Pagos</h2>
        <p className="subtitle">Consulta las deudas por tramos de liga</p>

        <div className="selectWrapper">
          <CustomSelect
            id="pagos-bloque"
            value={String(selectedBloque)}
            onChange={(v) => setSelectedBloque(Number(v))}
            options={bloques.map((b) => ({
              value: String(b.id),
              label: b.nombre,
            }))}
            className="select-primary"
            placeholder="Selecciona tramo"
          />
        </div>

        {pagosNoDisputado ? (
          <div className="pagos-empty">
            <span className="pagos-empty__emoji">⏳</span>
            <h5 className="mt-2 text-muted">Aún no hay datos</h5>
            <p
              className="text-muted"
              style={{ fontSize: "0.85rem", margin: 0 }}
            >
              Todavía no se han registrado jornadas o pagos para este tramo.
            </p>
          </div>
        ) : (
          <>
            <div className="pagos-header">
              <div className="pagos-col-pos">Pos</div>
              <div className="pagos-col-player">Jugador</div>
              <div className="pagos-col-puntos">Pts</div>
              <div className="pagos-col-pago">Deuda</div>
            </div>

            <div className="pagos-list">
              {pagos.map((j, idx) => {
                const isFree = (j.pago ?? 0) === 0;
                const medalClass =
                  j.posicion === 1
                    ? "pagos-row--gold"
                    : j.posicion === 2
                      ? "pagos-row--silver"
                      : j.posicion === 3
                        ? "pagos-row--bronze"
                        : j.posicion === 4
                          ? "pagos-row--fourth"
                          : "";

                const borderLeftWidth =
                  maxPagoActual && (j.pago ?? 0) > 0
                    ? Math.max(
                        2,
                        Math.round(((j.pago ?? 0) / maxPagoActual) * 6),
                      )
                    : 0;

                return (
                  <div
                    key={idx}
                    className={`pagos-row ${isFree ? "pagos-row--free" : ""} ${medalClass} ${(j.pago ?? 0) > 0 ? "pagos-row--owed" : ""}`}
                    style={
                      borderLeftWidth
                        ? {
                            borderLeft: `${borderLeftWidth}px solid var(--danger)`,
                          }
                        : undefined
                    }
                  >
                    <div className="pagos-col-pos">
                      {getMedal(j.posicion ?? 0)}
                    </div>

                    <div className="pagos-col-player">{j.jugador}</div>

                    <div className="pagos-col-puntos">{j.puntos}</div>

                    <div className="pagos-col-pago">
                      <span
                        className={`amount ${isFree ? "amount--free" : "amount--owed"}`}
                      >
                        {formatEuros(j.pago ?? 0)}€
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* No hay desertores en la temporada actual */}
      </div>
    </div>
  );
};
