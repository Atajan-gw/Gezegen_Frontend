import { createRouter, createWebHistory } from 'vue-router'
import CityList from '../components/CityList.vue'
import HotelList from '../components/HotelList.vue'
import HomePage from '../views/HomePage.vue'

const routes = [
    {
        path: '/',
        name: 'home',
        component: HomePage
    },

    {
        path: '/hotels',
        name: 'hotels',
        component: HotelList
    },

    {
        path: '/cities',
        name: 'cities',
        component: CityList
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router