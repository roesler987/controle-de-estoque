const express = require('express'); 
const bodyParser = require('body-parser');
const fs = require('fs'); 
const path = require('path'); 

const app = express(); 
const PORT = 3000; 

app.use(bodyParser.json()); 
app.use(express.static(__dirname)); 
app.use(express.static(path.join(__dirname, 'css')));

// Endpoint para cadastro de novos usuários
app.post('/submit-form', (req, res) => {
    const { name, email, password } = req.body; 
    const newUser = { name, email, password }; 
    const dataPath = path.join(__dirname, 'users.json'); 

    fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            return res.status(500).json({ message: 'Erro ao ler o arquivo.' });
        }

        const users = data ? JSON.parse(data) : []; 
        users.push(newUser); 

        fs.writeFile(dataPath, JSON.stringify(users, null, 2), (err) => {
            if (err) { 
                return res.status(500).json({ message: 'Erro ao salvar o arquivo.' }); 
            }

            res.json({ message: 'Usuário cadastrado com sucesso!', success: true }); 
        });
    });
});

// Endpoint para login de usuários
app.post('/login', (req, res) => {
    const { email, password } = req.body; 
    const dataPath = path.join(__dirname, 'users.json'); 

    fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err) { 
            return res.status(500).json({ message: 'Erro ao ler o arquivo.' }); 
        }

        const users = JSON.parse(data); 
        const user = users.find(user => user.email === email && user.password === password);

        if (user) { 
            res.json({ message: 'Login bem-sucedido!', success: true }); 
        } else { 
            res.json({ message: 'E-mail ou senha incorretos.', success: false }); 
        }
    });
});

// Endpoint para registrar relógios
app.post('/register-watch', (req, res) => {
    const { serialNumber, patrimony, problemDescription, location } = req.body; 
    const newWatch = { serialNumber, patrimony, problemDescription, location, repaired: false }; 
    const dataPath = path.join(__dirname, 'watches.json');

    fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            return res.status(500).json({ message: 'Erro ao ler o arquivo.' }); 
        }

        const watches = data ? JSON.parse(data) : []; 
        watches.push(newWatch); 

        fs.writeFile(dataPath, JSON.stringify(watches, null, 2), (err) => {
            if (err) { 
                return res.status(500).json({ message: 'Erro ao salvar o arquivo.' }); 
            }

            res.json({ message: 'Relógio cadastrado com sucesso!', success: true });
        });
    });
});

// Endpoint para obter relógios com problemas
app.get('/watches-with-problems', (req, res) => {
    const dataPath = path.join(__dirname, 'watches.json');

    fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erro ao ler o arquivo:', err);
            return res.status(500).json({ message: 'Erro ao ler o arquivo.' });
        }

        const watches = JSON.parse(data);
        // Adicione logs para cada relógio
        console.log('Estado dos relógios:', watches);
        
        // Filtra relógios que têm problemas e que não foram consertados
        const watchesWithProblems = watches.filter(watch => watch.problemDescription && !watch.repaired);

        console.log('Relógios com problemas não consertados:', watchesWithProblems);

        res.json(watchesWithProblems);
    });
});

// Endpoint para marcar relógios como consertados
app.post('/mark-as-repaired', (req, res) => {
    const { serialNumber } = req.body; 
    const dataPath = path.join(__dirname, 'watches.json'); 

    fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err) { 
            console.error('Erro ao ler o arquivo:', err);
            return res.status(500).json({ message: 'Erro ao ler o arquivo.' }); 
        }

        let watches = JSON.parse(data); 
        const index = watches.findIndex(watch => watch.serialNumber === serialNumber); 

        if (index !== -1) { 
            watches[index].repaired = true; 
            fs.writeFile(dataPath, JSON.stringify(watches, null, 2), (err) => {
                if (err) { 
                    console.error('Erro ao salvar o arquivo:', err);
                    return res.status(500).json({ message: 'Erro ao salvar o arquivo.' }); 
                }

                console.log(`Relógio com número de série ${serialNumber} marcado como consertado.`);
                res.json({ message: 'Relógio marcado como consertado.', success: true }); 
            });
        } else { 
            console.warn(`Relógio com número de série ${serialNumber} não encontrado.`);
            res.status(404).json({ message: 'Relógio não encontrado.', success: false }); 
        }
    });
});

// Endpoint para atualizar relógios
app.post('/update-watch', (req, res) => {
    const { serialNumber, patrimony, problemDescription, location } = req.body; 
    const dataPath = path.join(__dirname, 'watches.json'); 

    fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err) { 
            return res.status(500).json({ message: 'Erro ao ler o arquivo.' }); 
        }

        let watches = JSON.parse(data); 
        const index = watches.findIndex(watch => watch.serialNumber === serialNumber); 

        if (index !== -1) { 
            watches[index] = { serialNumber, patrimony, problemDescription, location, repaired: watches[index].repaired || false }; 
            fs.writeFile(dataPath, JSON.stringify(watches, null, 2), (err) => {
                if (err) { 
                    return res.status(500).json({ message: 'Erro ao salvar o arquivo.' }); 
                }

                res.json({ message: 'Relógio atualizado com sucesso!', success: true }); 
            });
        } else { 
            res.status(404).json({ message: 'Relógio não encontrado.', success: false }); 
        }
    });
});

// Endpoint para obter relógios consertados
app.get('/repaired-watches', (req, res) => {
    const dataPath = path.join(__dirname, 'watches.json'); 

    fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err) { 
            return res.status(500).json({ message: 'Erro ao ler o arquivo.' });
        }

        const watches = JSON.parse(data); 
        const repairedWatches = watches.filter(watch => watch.repaired); 

        res.json(repairedWatches); 
    });
});


// Endpoint para enviar o arquivo HTML de relógios consertados
app.get('/relogios-consertados.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'relogios-consertados.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
