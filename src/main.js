import Vue from 'vue';
import VueRouter from 'vue-router';

import App from './App.vue';

import Main from './pages/Main.vue';
import Proposals from './pages/Proposals.vue';
import Accounts from './pages/Accounts.vue';

Vue.use(VueRouter);

const routes = [
	{ path: '/', component: Main },
	{ path: '/proposals', component: Proposals },
	{ path: '/accounts', component: Accounts },
];

const router = new VueRouter({
	mode: 'history',
	routes,
});

new Vue({
	router,
	el: '#app',
	render: h => h(App),
});
