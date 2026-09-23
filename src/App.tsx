import React, { useState } from "react";
import { TiposVista } from "./models/models.ts";
import NavBar from "./components/navbar.tsx";
import { JornadasPanel } from "./components/jornadas.tsx";
import { PagosPanel } from "./components/pagos.tsx";
import { EstadisticasPanel } from "./components/estadisticas.tsx";
import { RachasPanel } from "./components/RachasPanel.tsx";
import { CaraACaraPanel } from "./components/CaraACara.tsx";
import { ManagerDelMesPanel } from "./components/ManagerDelMesPanel.tsx";
import { Historico2425Panel } from "./components/Historico2425Panel.tsx";
import { Historico2526Panel } from "./components/Historico2526Panel.tsx";
import { InstallAppModal } from "./components/InstallAppModal.tsx";

const App: React.FC = () => {
  const [vista, setVista] = useState<TiposVista>(TiposVista.Pagos);
  return (
    <div>
      <InstallAppModal />
      <NavBar onSelect={setVista} vistaActual={vista} />
      <main className="container-centered app-main">
        {vista === TiposVista.Jornadas && <JornadasPanel></JornadasPanel>}
        {vista === TiposVista.Pagos && <PagosPanel></PagosPanel>}
        {vista === TiposVista.Estadisticas && (
          <EstadisticasPanel></EstadisticasPanel>
        )}
        {vista === TiposVista.Rachas && <RachasPanel />}
        {vista === TiposVista.CaraACara && <CaraACaraPanel />}
        {vista === TiposVista.ManagerMes && <ManagerDelMesPanel />}
        {vista === TiposVista.Historico && <Historico2425Panel />}
        {vista === TiposVista.Historico2526 && <Historico2526Panel />}
      </main>
    </div>
  );
};
export default App;
