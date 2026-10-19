import axios from "axios";

const BASE_URL = "https://countriesnow.space/api/v0.1/countries/flag/images";


export const obtenerPaises = async () => {
  const LIMITE = 100;
  let offset = 0;
  let todos = [];
  let hayMas = true;

  while (hayMas) {
    const response = await cliente.get("", {
      params: { limit: LIMITE, offset },
    });

    const objects = response.data?.data?.objects ?? [];
    const meta = response.data?.data?.meta ?? {};
    todos = todos.concat(objects.map(normalizarPais));
    hayMas = Boolean(meta.more);
    offset += LIMITE;
  }

  return todos.sort((a, b) =>
    (a.name?.common ?? a.nombre ?? "").localeCompare(
      b.name?.common ?? b.nombre ?? ""
    )
  );
};

// Búsqueda por nombre usando el "aggregate" name, que busca en
// names.common / names.official / names.alternates / names.native
export const obtenerPaisNombre = async (nombre) => {
  const termino = nombre.trim();

  if (!termino) {
    return [];
  }

  try {
    const response = await cliente.get("/name", {
      params: { q: termino },
    });

    const objects = response.data?.data?.objects ?? [];
    return objects.map(normalizarPais);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return [];
    }

    throw error;
  }
};

export default cliente;