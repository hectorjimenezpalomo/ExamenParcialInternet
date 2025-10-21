import express = require("express");
const axios = require("axios") as import("axios").AxiosStatic; // Me daba error y he buscado soluciones por stackoverflow y esta funcionó

type LD = {
  id: number;
  filmName: string;
  rotationType: "CAV" | "CLV";
  region: string;
  lengthMinutes: number;
  videoFormat: "NTSC" | "PAL";
};

const lds: LD[] = [
  { 
    id: 1, 
    filmName: "Interstellar", 
    rotationType: "CAV", 
    region: "EEUU", 
    lengthMinutes: 120, 
    videoFormat: "NTSC" },
  { 
    id: 2, 
    filmName: "Las tortugas ninja", 
    rotationType: "CLV", 
    region: "EEUU", 
    lengthMinutes: 90, 
    videoFormat: "PAL" }
];

const app = express();
app.use(express.json());

app.get("/ld", (_req, res) => {
  res.json(lds);
});

app.get("/ld/:id", (req, res) => {
  const id = Number(req.params.id);
  const found = lds.find((d) => d.id === id);
  if (!found) return res.status(404).json({ message: "Equipo no encontrado" });
  res.json(found);
});

app.post("/ld", (req, res) => {
  const body = req.body as Omit<LD, "id">;
  const newLD: LD = {
    id: Date.now(),
    filmName: body.filmName,
    rotationType: body.rotationType,
    region: body.region,
    lengthMinutes: body.lengthMinutes,
    videoFormat: body.videoFormat
  };
  lds.push(newLD);
  res.status(201).json(newLD);
});

app.delete("/ld/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = lds.findIndex((d) => d.id === id);
  if (idx === -1) return res.status(404).json({ message: "Equipo no encontrado" });
  const removed = lds.splice(idx, 1)[0];
  res.json(removed);
});

const PORT = 3000;
const server = app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
  setTimeout(testApi, 1000);
});

async function testApi() {
  const base = `http://localhost:${PORT}`;
  try {
    const list1 = await axios.get<LD[]>(`${base}/ld`);
    console.log("Lista inicial:", list1.data);

    const nuevo = await axios.post<LD>(`${base}/ld`, {
      filmName: "EL padrino",
      rotationType: "CAV",
      region: "EEUU",
      lengthMinutes: 150,
      videoFormat: "PAL"
    });
    console.log("Creado:", nuevo.data);

    const list2 = await axios.get<LD[]>(`${base}/ld`);
    console.log("Lista tras crear:", list2.data);

    const createdId = nuevo.data.id;
    const deleted = await axios.delete<LD>(`${base}/ld/${createdId}`);
    console.log("Eliminado:", deleted.data);

    const list3 = await axios.get<LD[]>(`${base}/ld`);
    console.log("Lista final:", list3.data);
  } catch (err) {
    console.error("Error en testApi():", err);
  } finally {
    server.close(() => {
      console.log("Servidor detenido tras finalizar testApi().");
    });
  }
}
