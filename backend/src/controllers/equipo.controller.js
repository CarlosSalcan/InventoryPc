const connection = require('../connection');

const equipoController = {
    getEquipos: async (req, res) => {
        try {
            const equipos = await new Promise((resolve, reject) => {
                connection.query(`SELECT * FROM equipo`, (error, results) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(results);
                });
            });

            res.status(200).json({ success: true, equipos: equipos });
        } catch (error) {
            console.error('Error al obtener equipos:', error);
            res.status(500).json({ success: false, message: 'Error al obtener los equipos de BDD' });
        }
    },

    obtenerOpcSelect: async (req, res) => {
        try {
            const { tabla, campo } = req.params;

            const query = `SELECT ${campo} FROM ${tabla}`;

            const results = await new Promise((resolve, reject) => {
                connection.query(query, (error, results, fields) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(results);
                });
            });

            const options = results.map(result => result[campo]);
            res.json({ success: true, options: options });
        } catch (error) {
            console.error('Error al obtener opciones:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor' });
        }
    },

    modificarEquipo: async (req, res) => {
        try {
            const { codEquipo, nuevoCodAlmacen, nuevoTipoEquipo, nuevoPiso, nuevoDepartamento, nuevoTitular } = req.body;
            const query = `
                UPDATE equipo
                SET 
                    cod_almacen =?, 
                    tip_equipo =?, 
                    piso_ubic =?, 
                    serv_depar =?, 
                    nom_custodio =? 
                WHERE cod_equipo = ?`;

            await new Promise((resolve, reject) => {
                connection.query(query, [nuevoCodAlmacen, nuevoTipoEquipo, nuevoPiso, nuevoDepartamento, nuevoTitular, codEquipo], (error, results, fields) => {
                    if (error) {
                        console.error('Error al guardar cambios en el equipo:', error);
                        res.status(500).json({ success: false, message: 'Error interno del servidor' });
                        return;
                    }
                    res.json({ success: true, message: 'Cambios guardados correctamente' });
                });
            });
        } catch (error) {
            console.error('Error al guardar cambios en el equipo:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor' });
        }
    },

    getEquipoById: async (req, res) => {
        try {
            const { id } = req.params;
            const results = await new Promise((resolve, reject) => {
                connection.query('SELECT cod_equipo, piso_ubic, serv_depar, nom_custodio FROM equipo WHERE cod_equipo = ?', [id], (error, results, fields) => {
                    if (error) {
                        console.error('Error al obtener equipo por ID:', error);
                        reject(error);
                        return;
                    }

                    if (results.length === 0) {
                        res.status(404).json({ success: false, message: 'Equipo no encontrado' });
                        return;
                    }
                    resolve(results[0]);
                });
            });

            res.json({ success: true, equipo: results });
        } catch (error) {
            console.error('Error al obtener equipo por ID:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor' });
        }
    },

    enviarBodegaEquipo: async (req, res) => {
        try {
            const { id } = req.params;
            const { piso_ubic, serv_depar, nom_custodio } = req.body;
            console.log(id, nom_custodio, serv_depar, piso_ubic)

            await new Promise((resolve, reject) => {
                connection.query('UPDATE equipo SET piso_ubic = ?, serv_depar = ?, nom_custodio = ?  WHERE cod_equipo = ?', [piso_ubic, serv_depar, nom_custodio, id], (error, results, fields) => {
                    if (error) {
                        console.error('Error al enviar equipo a bodega:', error);
                        reject(error);
                        return;
                    }
                    resolve();
                });
            });

            res.json({ success: true, message: 'Equipo modificado' });
        } catch (error) {
            console.error('Error al enviar equipo a bodega:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor' });
        }
    },

    obtenerDatosComponentes: async (req, res) => {
        try {
            const { tabla, codEquipo } = req.params;
            const query = `SELECT * FROM ${tabla} WHERE cod_equipo = ?`;
            const results = await new Promise((resolve, reject) => {
                connection.query(query, [codEquipo], (error, results, fields) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(results);
                    //console.log("SERVIDOR: ",results)
                });
            });
    
            if (results.length === 0) {
                res.status(404).json({ success: false, message: `No se encontraron datos para ${tabla} del equipo especificado` });
                return;
            }
    
            res.json({ success: true, [tabla]: results[0] });
        } catch (error) {
            console.error(`Error al obtener datos de ${tabla}:`, error);
            res.status(500).json({ success: false, message: 'Error interno del servidor' });
        }
    }
};

module.exports = equipoController;
