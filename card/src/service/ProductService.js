import axios from "axios";
export default class ProductService {

    getProductsSmall() {
		return fetch('demo/data/clients.json').then(res => res.json()).then(d => console.log(d.data));
	}

	getProducts() {
	return axios.get('http://127.0.0.1:8000/api/clients/').then(d => d).then(d => (d.data));
    }

    
}

    