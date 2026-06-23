import { getMarcas,getMarcaId,crearMarca,updateMarca, deleteMarca } from "../models/marcas.js";

const listadoMarcas = async(req,res) => {
    try{
        const listaMarcas = await getMarcas();

        if(!listaMarcas){
            return res.status(400).json({ message:  "Marcas no encontradas"})
        }
        res.status(200).json(listaMarcas)
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Error del servidor"})
    }
}

const marcaById = async(req, res) => {
    try{
        const { id } = req.params;

        if(!id){
            return res.status(400).json({ message: "Id no encontrado"});
        }

        const marcaId = await getMarcaId(id);

        if(!marcaId){
            return res.status(404).json({message: 'Id de marca no encontrado'})
        }

        res.status(200).json(marcaId)
    }catch(error){
        console.error("Error: ", error)
        res.status(500).json({ message: "Error del deam"})
    }
}

const createMarca = async(req, res) => {
    try{
        const { nombre } = req.body;

        if(!nombre){
            return res.status(400).json({ message: "Necesita registrar un nombre"})
        }

        const nuevaMarca = await crearMarca({ nombre });

        res.status(201).json(nuevaMarca)
    }catch(error){
        console.error("Error: ", error)
        res.status(500).json({ message: "Error del servidor"});
    }
}

const marcaUpdate = async(req,res) => {
    try{
        const { id } = req.params;
        const { nombre } = req.body;

        if(!id){
            return res.status(400).json({ message: "Id no encontrado"})
        }

        const marcaUpdt = await updateMarca(id, { nombre });

        res.status(200).json(marcaUpdt);
    }catch(error){
        console.error("Error: ", error)
    }
}

const marcaDelete = async(req,res) => {
    try{
        const { id } = req.params;

        if(!id){
            return res.status(400).json({ message: "Id no encontrado"});
        }

        const eliminarMarca = await deleteMarca(id);

        return res.status(200).json({ message: `Marca eliminada ${id}`});
    }catch(error){
        console.error('Error', error)
        res.status(500).json({ message: "Error del deam"})
    }
}

export { listadoMarcas, marcaById, createMarca, marcaUpdate, marcaDelete}