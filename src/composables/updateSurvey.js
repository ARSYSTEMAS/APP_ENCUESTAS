import ServiceEncuestas from "../services/Survey";
const service_encuesta = new ServiceEncuestas();

export default async function update(idEncuesta, username, token, date) {
  try {
    const data = {
      Id: idEncuesta,
      UsrAct: username,
      FecAct: date,
    };

    await service_encuesta.Update({ data: data, token: token }); // actualizo encuestas
  } catch (error) {
    console.error(error);
  }
}
