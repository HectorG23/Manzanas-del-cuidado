const express = require('express');
const bodyParser=require('body-parser');
const mysql=require('mysql2/promise');
const app=express();
const path=require('path')
const session=require('express-session');
//configurar middleware


app.use(bodyParser.urlencoded({ extended: true } ) );
app.use(bodyParser.json());
app.use(express.static(__dirname));

app.use(
    session({
        secret:"hola",
        resave: false,
        saveUninitialized: false
    })
);

//configurar conexion a la base de datos
const db={
    host: 'localhost',
    user: 'root' ,
    password: '',
    database: 'manzanotas',
};

app.post('/crear', async (req, res)=>{
    const {nombre_usuarios,tipo_documento,documento,id_m2}=req.body;
    try{
    const input=await mysql.createConnection(db)    
    let [indicador]= await input.execute('SELECT * FROM usuarios WHERE documento= ? AND tipo_documento= ?',
    [documento,tipo_documento])
    
    if(indicador.length>0){
        res.status(401).send(`
        <script>
            window.onload= function() {
                alert('Ya existe este usuario');
                window.location.href ='http://127.0.0.1:5500/vista/html/inicio.html';
        }
        </script>
        `)}
    else{    
    await input.execute('INSERT INTO usuarios (nombre_usuarios,tipo_documento,documento,id_m2) VALUES (?,?,?,?)', 
    [nombre_usuarios,tipo_documento,documento,id_m2])
    res.status(201).send(`
    <script>
        window.onload= function() {
            alert('Datos guardados');
            window.location.href='http://127.0.0.1:5500/vista/html/inicio.html'; 
    }
    </script>
    `)}
    input.end()
    }
    catch(error){
        console.error('Error en el servidor',error)
        res.status(500).send('paila el envio')
    }
    });

    app.post('/iniciar',async(req,res)=>{
        const{tipo_documento,documento}=req.body
        try{
        const input=await mysql.createConnection(db)    
         //Verificar credenciales
         let [indicador]= await input.execute('SELECT * FROM usuarios WHERE tipo_documento= ? AND documento= ? ',
         [tipo_documento,documento])
         console.log(indicador)
         if(indicador.length>0){
            req.session.usuario=indicador[0].nombre_usuarios;
            req.session.documento = documento;
            if(indicador[0].rol=="Admin"){//Se indica el rol admin
                const usuario ={nombre_usuario : indicador[0].nombre_usuarios}
                console.log(usuario)
                res.locals.usuario=usuario
                res.sendFile(path.join(__dirname,`../../vista/html/Admin.html`))
                }else{
                    const usuario ={nombre_usuario : indicador[0].nombre_usuarios}
                    console.log(usuario)
                    res.locals.usuario=usuario
                    res.sendFile(path.join(__dirname,`../../vista/html/usuario.html`))
                }
         }
         else{
            res.status(401).send('Usuario no encontrado')
         }
         input.end()
        }
        catch(error){
            console.log('Error en el servidor:',error)
            res.status(500).send(`
            <script>
            window.onload= function() {
                alert('Error en el servidor');
                window.location.href='http://127.0.0.1:5500/vista/html/inicio.html';
            }
            </script>
            `)
        }
    })
    app.post('/obtener-usuario', (req,res)=>{
        const usuario = req.session.usuario
        console.log(usuario)
        if(usuario){
            res.json({nombre_usuario : usuario})
            /* res.status(200).send("iniciado") */
        }else{
            res.status(401).send('Usuario no encontrado')
       
        }
    });

    app.post('/obtener-servicios-usuario',async(req,res)=>{
    const nombreusuario=req.session.usuario
    const doc=req.session.documento
    console.log(nombreusuario,doc)
        try {
            const input=await mysql.createConnection(db) 
            const[serviciosData]=await input.execute('SELECT servicios.nombre_servicios FROM usuarios INNER JOIN manzanas ON manzanas.id_m = usuarios.id_m2 INNER JOIN m_s ON m_s.id_m1 = manzanas.id_m INNER JOIN servicios ON servicios.ud_servicios = m_s.id_s1 WHERE usuarios.documento= ? ORDER BY servicios.ud_servicios ASC',[doc])
            console.log(serviciosData)
            res.json({servicios: serviciosData.map(row=>row.nombre_servicios)})
            input.end()
        } catch (error) {
            console.error('Error en el servidor',error)
            res.status(500).send('yucas en el server')
        }
    })
    app.post('/guardar-servicios-usuario',async(req,res)=>{
        const{servicios,fechahora}=req.body;
        const nombreusuario=req.session.usuario
        const doc=req.session.documento
        console.log(nombreusuario,doc)
        const input=await mysql.createConnection(db)
        
        try {
            for(const servicio of servicios){
                const [consulid]= await input.execute('SELECT id_usuarios FROM usuarios WHERE documento= ?',[doc])
                 console.log(consulid)
                const [consulService] = await input.query('SELECT servicios.ud_servicios FROM servicios WHERE servicios.nombre_servicios= ?',[servicios])
                console.log(consulService)
                await input.execute('INSERT INTO solicitudes (solicitudes_usuarios, fecha, codigoS) VALUES (?,?,?)',
                [consulid[0].id_usuarios,fechahora,consulService[0].ud_servicios])
                res.status(200).send('servicios guardados') 
            }
            input.end()
        } catch (error) {
            console.error('Error en el servidor',error)
            res.status(500).send('yucas en el server')
        }
        input.end()
    })

    app.post('/recibir-solicitudes',async(req, res)=>{
        const nombreusuario=req.session.usuario
        const doc=req.session.documento
        console.log(nombreusuario,doc)
     try {
        const input=await mysql.createConnection(db);
        const[reciData]=await input.execute('SELECT solicitudes.id_solicitud, servicios.nombre_servicios, solicitudes.fecha FROM solicitudes INNER JOIN usuarios ON solicitudes.solicitudes_usuarios = usuarios.id_usuarios INNER JOIN manzanas ON usuarios.id_m2 = manzanas.id_m INNER JOIN m_s ON manzanas.id_m = m_s.id_m1 INNER JOIN servicios ON m_s.id_s1 = servicios.ud_servicios WHERE usuarios.documento = ? AND solicitudes.codigoS = servicios.ud_servicios', [doc])   
        console.log(reciData)
        res.json({
            solicitudes: reciData.map(row =>([
              row.id_solicitud,
              row.nombre_servicios,
              row.fecha,
              row.tipo  
            ]))
        })
        input.end()
     } catch (error){
        console.error('Error en el servidor',error)
        res.status(500).send('yucas el server')
     }  
  })
   app.delete('/eliminar_solicitud', async (req, res)=>{
        const {id_sol} = req.body
        const input=await mysql.createConnection(db);
        try{
            await input.execute('DELETE FROM solicitudes WHERE id_solicitud = ?',[id_sol]);
            res.status(200).send(`<script>
            window.onload=function(){
                alert('solicitud eliminada');
                window.location.href='http://127.0.0.1:5500/vista/html/usuario.html';
            }
            </script
            `)
        }catch(error){
            console.error('Error en el servidor', error)
            res.status(500).send('reinicie el server')
        }
    })
    
    //=========ADMIN========================//

    app.get('/Admin',(req,res)=>{
        res.sendFile(path.join(__dirname,`../../vista/html/Admin.html`))
    })

    app.post('/registro-manzanas',async(req,res)=>{
        const {nombre_manzana,direccion}=req.body
        try {
            const input=await mysql.createConnection(db);
            const indicador=await input.execute('SELECT * FROM manzanas WHERE manzanas.nombre_manzana = ? AND manzanas.direccion = ?',[nombre_manzana,direccion]);
            if(indicador.length === 0){
                res.status(401).send('<script>window.onload=function(){alert("Manzana ya esta registrada");}</script>')
            }
            else{
                await input.execute('INSERT INTO manzanas(nombre_manzana,direccion) VALUES(?,?)',[nombre_manzana,direccion]);
                res.status(201).send(`<script>
                window.onload=function(){
                    alert("Dato registrado") 
                    window.location.href="/Admin"
                }
                </script>`);
            }
        } catch (error) {
           console.error('error en el server',error);
           res._construct.status(500).send('error al registrar la manzana') 
        }
    });

    app.post('/obtener-manzanas',async(req,res)=>{
    const input=await mysql.createConnection(db);
    try {
        const[indicador]= await input.execute('SELECT * FROM manzanas');
        console.log(indicador)
        res.json({
            manzanasr: indicador.map(row =>([
                row.id_m,
                row.nombre_manzana,
                row.direccion,
            ]))
    })
    await input.end()
    } catch (error) {
        console.error('error en el server ',error);
            res.status(500).send('error al registrar manzana');
    }
    })

    app.post('/update-manzana', async (req,res)=>{
        const input =await mysql.createConnection(db)
        const {nombre_manzana,direccion,id_m}= req.body;
        
        try {
            await input.execute('UPDATE manzanas SET nombre_manzana=?, direccion=? WHERE id_m=?',[nombre_manzana,direccion,id_m])
            res.status(200).send(`<script> 
            alert('manzana actualizada');
            window.location.href="/Admin"
            </script>`)
        } catch (error) {
            console.error('Error en el server',error);
            res.status(500).send('error al registrar manzana');
        }
    })
//---------------registro servicos-------------------------//
    app.post('/registro-service',async(req,res)=>{
        const input=await mysql.createConnection(db)
        const{nombre_servicios,tipo}=req.body;
        try {
            const [indica]= await input.execute('SELECT * FROM servicios WHERE servicios.nombre_servicios = ? AND servicios.tipo = ?',[nombre_servicios,tipo]);
            if(indica.length > 0){
                res.status(401).send('<script>window.onload=function(){alert("Servicio ya esta Registrado"); window.location.href="/Admin"}</script>');
            }
            else{
                await input.execute('INSERT INTO servicios(nombre_servicios,tipo) VALUES(?,?)',[nombre_servicios,tipo]);
                res.status(201).send(`<script>
                window.onload=function(){
                    alert("Dato registrado")
                    window.location.href="/Admin"
                    }
                    </script>`);
            }
            await input.end();
        } catch (error) {
            console.error('Hubo un error con el server: ',error);
            res.status(500).send('Error al regitrar servicio');
        }
    })

    app.post('/obtener-service', async (req,res)=>{
        const input=await mysql.createConnection(db);
        try{
            const [indica] = await input.execute('SELECT * FROM servicios');
            console.log(indica)
            res.json({
                manzanasr: indica.map(row =>([
                row.ud_servicios,
                row.nombre_servicios,
                row.tipo,
                ]))
            })
        await input.end();
        }
        catch(error){
            console.error('Hubo un error con el server: ',error);
            res.status(500).send('Error en el obtener servicio');
        }
    })

    app.post('/update-servicio', async (req, res)=>{
        const input = await mysql.createConnection(db)
        const {nombre_servicios, tipo, id_servicios} = req.body;
        try{
            await input.execute('UPDATE servicios SET nombre_servicios=?, tipo = ? WHERE ud_servicios = ?;', [nombre_servicios,tipo,id_servicios])
            res.status(200).send(`<script> 
            window.onload=function(){
                alert("Servicio Actualizado")
                window.location.href="/Admin"
                }

                    </script>`)
        }catch (error) { 
            //Capturamos el error.
            console.error('hubo un error en el server', error)
            res.status(500).send('error al actualizar servicio, reinicie el server')
        }
    }) 

    app.delete('/delete-servicio', async (req, res)=>{
        const {indicam}=req.body
        const input = await mysql.createConnection(db);
        try {
            await input.execute('DELETE FROM servicios WHERE ud_servicios = ?',[indicam]);
            res.status(200).send('Servicio eliminado'); //Envía confirmación al html

        } catch (error) {
            console.error('error en el server', error)
            res.status(500).send('reinicie el server')
        }
    })
//------------apartado usuario---------------------//
    app.post('/registro-User', async (req,res)=>{
        const input=await mysql.createConnection(db);
        const [nombre_user,tipo_doc,documento,id_user]=req.body;
        try{
            const Indicar = await input.execute('SELECT * FROM usuarios WHERE usuarios.nombre_usuarios = ? AND usuarios.tipo_documento = ? AND usuarios.documento = ? AND id_usuarios',[nombre_user,tipo_doc,documento,id_user]);
            if(Indicar.length === 0){
                res.status(401).send('<script>window.onload=function(){alert("Servicio ya Registrado");}</script>');
            }
            else{
                await input.execute('INSERT INTO usuarios(nombre_usuarios,tipo_documento,documento,id_usuarios) VALUES(?,?,?,?)',[nombre_user,tipo_doc,documento,id_usuer]);
                res.status(201).send('<script>window.onload=function(){alert("Dato registrado");}</script>');
            }
           
        await input.end();
        }
        catch(error){
            console.error('Hubo un error con el servidor: ',error);
            res.status(500).send('Erro en el regitrar Servicio');
        }
    })

    app.post('/obtener-User', async (req,res)=>{
        const input=await mysql.createConnection(db);
        try{
            const [indicar] = await input.execute('SELECT usuarios.id_usuarios, usuarios.nombre_usuarios, usuarios.tipo_documento, usuarios.documento, manzanas.nombre_manzana from usuarios INNER JOIN manzanas ON usuarios.id_m2=manzanas.id_m WHERE usuarios.id_m2=manzanas.id_m');
            console.log(indicar)
            res.json({
                manzanasr: indicar.map(row =>([
                row.id_usuarios,
                row.nombre_usuarios,
                row.tipo_documento,
                row.documento,
                row.nombre_manzana
                ]))
            })
        await input.end();
        }
        catch(error){
            console.error('Hubo un error con el servidor: ',error);
            res.status(500).send('Erro en el regitrar Servicio');
        }
    })

    app.post('/actualizar-user', async (req, res)=>{
        const input = await mysql.createConnection(db)
        const {tipo_documento, id_m2, id_usuarios} = req.body;
        console.log(tipo_documento, id_m2, id_usuarios)
        try{
            await input.execute('UPDATE usuarios SET tipo_documento=?, id_m2= ? WHERE id_usuarios=?', [tipo_documento,id_m2,id_usuarios])
            res.status(200).send(`<script>
                    alert('Usuarios Actualizado');
                    window.location.href="/Admin"
                    </script>`)
        }catch (error) { 
            //Capturamos el error.
            console.error('Error en el servidor', error)
            res.status(500).send('Reinicie el servidor')
        }
    }) 

    app.delete('/eliminar_User',async (req,res)=>{
        const {indicado}=req.body;
        const input=await mysql.createConnection(db);
        try {
            await input.execute('DELETE FROM usuarios WHERE documento = ?',[indicado])
            console.log('usuario eliminado correctamente')
            res.status(200).send(`oki`)
        } catch (error) {
            console.error('Error en el servidor', error)
            res.status(500).send('reinicie el server') 
        }
    })



    app.post('/log-out',(req,res)=>{
        req.session.destroy((err)=>{
            if(err){
                console.error('hubo un error',err)
                res.status(500).send("Error cerrando sesion")
            }
            else{
                res.status(200).send('sesion cerrada correctamente')
            }
        })
    })

    app.listen(3000,()=>{
        console.log('servidor node.js escuchando')
    })


    /*
    
    <!-- <div class="card mx-2 mt-3" style="width: 18rem; border: 2px solid   ">
                                <div class="card-body">
                                  <h3 class="card-title">${reciData[1]}</h3>
                                  <h5 class="card-text">ID: ${reciData[0]}</h5>
                                  <h5  class="card-text">Fecha: ${reciData[2]}</h5>
                                  <button type="button" class="btn btn-danger">eliminar servicios</button>
                                </div>
                              </div> -->
    
    */