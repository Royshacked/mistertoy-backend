
import fs from 'fs'
import { utilService } from './util.service.js'
import { loggerService } from './logger.service.js'

export const toyService = {
    query,
    getById,
    remove,
    save
}

const toys = utilService.readJsonFile('data/toy.json')

function query(filterBy = {}) {
    let filteredToys = toys

    if (filterBy.name) {
        const regExp = new RegExp(filterBy.name, 'i')
        filteredToys = filteredToys.filter(toy => regExp.test(toy.name))
    }

    if (filterBy.inStock !== 'all') {
        filteredToys = filteredToys.filter(toy => toy.inStock.toString() === filterBy.inStock || filterBy.inStock === 'all')
    }

    if (filterBy.sortBy) {
        const { sortBy } = filterBy
        const dir = +filterBy.desc

        filteredToys = filteredToys.sort((t1, t2) => {
            if (sortBy === 'name') return t1.name.localeCompare(t2.name) * dir
            if (sortBy === 'price' || sortBy === 'createdAt') return (t1[sortBy] - t2[sortBy]) * dir
        })
    }
    return Promise.resolve(filteredToys)
}

function getById(toyId) {
    console.log(toys)
    const toy = toys.find(toy => toy._id === toyId)
    return Promise.resolve(toy)
}

function remove(toyId) {
    const idx = toys.findIndex(toy => toy._id === toyId)
    if (idx === -1) return Promise.reject('No Such toy')
    const toy = toys[idx]
    toys.splice(idx, 1)
    return _savetoysToFile()
}

function save(toy) {
    if (toy._id) {
        const toyToUpdate = toys.find(currtoy => currtoy._id === toy._id)

        toyToUpdate.name = toy.name
        toyToUpdate.price = toy.price
        toy = toyToUpdate
    } else {
        toy._id = utilService.makeId()
        toy.createdAt = Date.now()
        toys.push(toy)
    }

    return _savetoysToFile().then(() => toy)
}


function _savetoysToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(toys, null, 4)
        fs.writeFile('data/toy.json', data, (err) => {
            if (err) {
                loggerService.error('Cannot write to toys file', err)
                return reject(err)
            }
            resolve()
        })
    })
}
