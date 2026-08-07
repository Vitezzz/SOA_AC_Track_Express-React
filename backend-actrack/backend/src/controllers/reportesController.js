import { selectReportesCache } from '../models/reportes_cache.js';
import { recalcularTodosLosReportes } from '../services/reportesService.js';

const getReportesCache = async (req, res) => {
    try {
        const reportes = await selectReportesCache();
        res.status(200).json(reportes);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
}

const postRecalcularReportes = async (req, res) => {
    try {
        await recalcularTodosLosReportes();
        const reportesActualizados = await selectReportesCache();
        res.status(200).json(reportesActualizados);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
}

export { getReportesCache, postRecalcularReportes };