import path from 'path';

import express from 'express'
import cors from 'cors'
import { toyService } from './services/toy.service.js'
import { loggerService } from './services/logger.service.js';

const app = express()
const corsOptions = {
    origin: [
        'http://127.0.0.1:8080',
        'http://localhost:8080',

        'http://127.0.0.1:5173',
        'http://localhost:5173',

        'http://127.0.0.1:5174',
        'http://localhost:5174',
    ],
    credentials: true
}

// Express Config:
app.use(express.static('public'))
app.use(express.json())
app.use(cors(corsOptions))

// toy LIST
app.get('/api/toy', (req, res) => {
    const filterBy = {
        name: req.query.name || '',
        inStock: req.query.inStock || 'all',
        sortBy: req.query.sortBy || '',
        desc: +req.query.desc || -1,
        labels: req.query.labels || [],
    }

    toyService.query(filterBy)
        .then((toys) => {
            res.send(toys)
        })
        .catch((err) => {
            loggerService.error('Cannot get toys', err)
            res.status(400).send('Cannot get toys')
        })
})

//Labels READ
app.get('/api/toy/labels', (req, res) => {
    toyService.getLabels()
        .then((labels) => res.send(labels))
        .catch((err) => {
            loggerService.error('Cannot get labels')
            res.status(400).send('Cannot get labels')
        })
})

// toy READ
app.get('/api/toy/:toyId', (req, res) => {
    const { toyId } = req.params
    toyService.getById(toyId)
        .then((toy) => {
            res.send(toy)
        })
        .catch((err) => {
            loggerService.error('Cannot get toy', err)
            res.status(400).send('Cannot get toy')
        })
})

// toy CREATE
app.post('/api/toy', (req, res) => {
    const toy = {
        name: req.body.name,
        price: req.body.price,
        labels: req.body.labels,
        inStock: req.body.inStock
    }
    toyService.save(toy)
        .then((savedtoy) => {
            res.send(savedtoy)
        })
        .catch((err) => {
            loggerService.error('Cannot save toy', err)
            res.status(400).send('Cannot save toy')
        })

})

// toy UPDATE
app.put('/api/toy', (req, res) => {
    const toy = {
        _id: req.body._id,
        name: req.body.name,
        price: +req.body.price,
        labels: req.body.labels,
    }
    toyService.save(toy)
        .then((savedtoy) => {
            res.send(savedtoy)
        })
        .catch((err) => {
            loggerService.error('Cannot save toy', err)
            res.status(400).send('Cannot save toy')
        })

})

// toy DELETE
app.delete('/api/toy/:toyId', (req, res) => {
    const { toyId } = req.params
    toyService.remove(toyId)
        .then(() => {
            loggerService.info(`toy ${toyId} removed`)
            res.send('Removed!')
        })
        .catch((err) => {
            loggerService.error('Cannot remove toy', err)
            res.status(400).send('Cannot remove toy')
        })

})

app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const PORT = process.env.PORT || 3030
app.listen(PORT, () =>
    loggerService.info(`Server listening on port http://127.0.0.1:${PORT}/`)
)
