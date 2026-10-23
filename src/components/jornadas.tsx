import { useState, useEffect } from "react";
import { calcularAcumulado, JugadorPago } from "../utils/calcularAcumulado.ts";
import "./jornadas.css";
import CustomSelect from "./CustomSelect.tsx";

export const JornadasPanel = () => {
  const [selectedJornada, setSelectedJornada] = useState<number>(1);
  const [jornada, setJornada] = useState<JugadorPago[]>([]);

  useEffect(() => {
    setJornada(calcularAcumulado(selectedJornada, selectedJornada));
  }, [selectedJornada]);

  // We now use fixed medal backgrounds for the podium and a neutral
  // background for the rest. Additionally, if a player has a payment,
  // we add a red left indicator proportional to the amount paid.

  const getMedal = (pos: number) => {
    if (pos === 1) return "🥇";
    if (pos === 2) return "🥈";
    if (pos === 3) return "🥉";
    return <span className="medal-text">{pos}º</span>;
  };

  const formatEuros = (num: number) => {
    return num % 1 === 0 ? num : num.toFixed(2);
  };

  const maxPagoJornada = Math.max(...jornada.map((p) => p.pago ?? 0), 0);
  const jornadaNoDisputada =
    jornada.length === 0 || jornada.every((j) => j.puntos === 0);

  return (
    <div className="jornadas-panel">
      <div className="panel panel-screen">
        <h2 className="h2">🗓️ Jornadas</h2>
        <p className="subtitle">Consulta los puntos y pagos por jornada</p>

        <div className="selectWrapper">
          <CustomSelect
            id="jornada-select"
            value={String(selectedJornada)}
            onChange={(v) => setSelectedJornada(Number(v))}
            options={Array.from({ length: 38 }, (_, i) => i + 1).map((j) => ({
              value: String(j),
              label: `Jornada ${j}`,
            }))}
            className="select-primary"
            placeholder="Selecciona jornada"
          />
        </div>

        <div className="tableWrapper">
          {selectedJornada === 8 && (
            <div className="jornada-warning" role="alert">
              Faltan por sumar los puntos del Rayo Vallecano - Atletico de
              Bilbao.
            </div>
          )}

          {jornadaNoDisputada ? (
            <div className="jornada-empty">
              <span className="jornada-empty__emoji">⏳</span>
              <h5 className="mt-2 text-muted">Jornada sin empezar</h5>
              <p
                className="text-muted"
                style={{ fontSize: "0.85rem", margin: 0 }}
              >
                Aún no hay puntos registrados.
              </p>
            </div>
          ) : (
            <>
              <div className="jornada-header">
                <div className="col-pos">Pos</div>
                <div className="col-jugador">Jugador</div>
                <div className="col-puntos">Pts</div>
                <div className="col-pago">Pago</div>
              </div>

              <div className="jornada-list">
                {jornada.map((j, idx) => {
                  const isFree = (j.pago ?? 0) === 0;
                  const esPodio = (j.posicion ?? 0) <= 3;
                  // compute medal class
                  const medalClass =
                    (j.posicion ?? 0) === 1
                      ? "jornada-row--gold"
                      : (j.posicion ?? 0) === 2
                        ? "jornada-row--silver"
                        : (j.posicion ?? 0) === 3
                          ? "jornada-row--bronze"
                          : (j.posicion ?? 0) === 4
                            ? "jornada-row--fourth"
                            : "";

                  // border thickness proportional to pago (min 0, max 6px)
                  const borderLeftWidth =
                    maxPagoJornada > 0 && (j.pago ?? 0) > 0
                      ? Math.max(
                          2,
                          Math.round(((j.pago ?? 0) / maxPagoJornada) * 6),
                        )
                      : 0;

                  return (
                    <div
                      key={idx}
                      className={`jornada-row ${isFree ? "jornada-row--free" : ""} ${medalClass} ${(j.pago ?? 0) > 0 ? "jornada-row--owed" : ""}`}
                      style={
                        borderLeftWidth
                          ? {
                              borderLeft: `${borderLeftWidth}px solid var(--danger)`,
                            }
                          : undefined
                      }
                    >
                      <div className="jornada-pos">
                        {getMedal(j.posicion ?? 0)}
                      </div>

                      <div
                        className={`jornada-player ${esPodio ? "jornada-player--podio" : ""}`}
                      >
                        {j.jugador}
                      </div>

                      <div
                        className={`jornada-pts ${esPodio ? "jornada-pts--podio" : "jornada-pts--default"}`}
                      >
                        {j.puntos}
                      </div>

                      <div className="jornada-amount">
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
        </div>
      </div>
    </div>
  );
};
