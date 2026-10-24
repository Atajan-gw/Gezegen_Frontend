import { createRouter, createWebHistory } from 'vue-router'
import CityList from '../components/CityList.vue'
import HotelList from '../components/HotelList.vue'
import TicketList from '../components/TicketList.vue'
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

    {
        path: '/tickets',
        name: 'tickets',
        component: TicketList
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router