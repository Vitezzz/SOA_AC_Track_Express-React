import { selectRutas, selectRutasById, insertRutas,
    updateRutas, deleteRutas
 } from "../models/rutas.js";

 const getRutas = async(req, res) => {
    try{

        const listaRutas = await selectRutas();

        if(listaRutas.length === 0){
            return res.status(400).json({ message : "Lista de Rutas no encontrada"})
        }

        res.status(200).json(listaRutas)
        
    }catch(error){
        console.error('Error', error);
        return res.status(500).json({ message : "Error del servidor"})
    }
 }

 const getRutasById = async(req, res) => {
    try{

        const { id } = req.params;

        if(!id){
            return res.status(404).json({ message : "Id no encontrado"})
        }

        const rutasId = await selectRutasById(id);

        if(!rutasId){
            return res.status(404).json({ message : "Ruta no encontrada"})
        }

        res.status(200).json(rutasId);
        
    }catch(error){
        console.error('Error', error);
        return res.status(500).json({ message : "Error del servidor"})
    }
 }

 const postRutas = async(req, res) => {
    try{

        const { fecha_ruta, estado = "pendiente" } = req.body;

        if(!fecha_ruta) return res.status(400).json({ message : "Fecha requerida"})

        const nuevaRuta = await insertRutas({ fecha_ruta, estado });

        res.status(201).json({
            id: nuevaRuta.id,
            fecha_ruta: nuevaRuta.fecha_ruta,
            estado: nuevaRuta.estado
        })
        
    }catch(error){
        console.error('Error', error);
        return res.status(500).json({ message : "Error del servidor"})
    }
 }

 const putRutas = async(req, res) => {
    try{

        const { id } = req.params;

        const { fecha_ruta, estado } = req.body;

        if(!id) return res.status(404).json({message : "Id no encontrado"})

        const rutaId = await updateRutas(id, { fecha_ruta, estado})

        if(!rutaId) return res.status(404).json({ message : "Ruta no encontrada"})

        res.status(200).json({
            id: rutaId.id,
            fecha_ruta: rutaId.fecha_ruta,
            estado: rutaId.estado
        })
        
    }catch(error){
        console.error('Error', error);
        return res.status(500).json({ message : "Error del servidor"})
    }
 }

 const dltRutas = async(req, res) => {
    try{
        
        const {id } = req.params;

        if(!id) return res.status(404).json({ message : "Id no encontrado"})

        const rutaDlt = await deleteRutas(id);

        if(!rutaDlt) return res.status(404).json({ message : "Ruta no encontrada"});

        res.status(200).json(rutaDlt);
    }catch(error){
        console.error('Error', error);
        return res.status(500).json({ message : "Error del servidor"})
    }

 }

 export { getRutas, getRutasById, postRutas, putRutas, dltRutas}