import axios from 'axios';

class apiConnector{
	async fetch(namespace, data = {}){
//	JAVASCRIPT FETCH VERSION
//		let options = {
//			method: 'POST',
//			headers: {
//				'Accept': 'application/json',
//				'Content-Type': 'application/json'
//			}
//		};
//		if(data) options.body = JSON.stringify(data); 
//		const response = await fetch("http://localhost:3001"+namespace,options);
//		const body = await response.json();
		
		console.log("TODO: FETCH api Shouild not be hard set to localhost");
		const response = await axios.post("http://localhost:3001"+namespace,data);
		console.log("TODO: DEAL WITH ERROR RESPONSES");
		console.log(response);
		
		// Save the token
		if(response.data.accessToken) localStorage.setItem("accessToken",response.data.accessToken);

		return response.data.data;
	}
//	getAccessToken(){
//		return localStorage.getItem("token") || null;
//	}
	deleteAccessToken(){
		localStorage.removeItem("accessToken");
		return true;
	}
	accessTokenExists(){
		return (localStorage.getItem("accessToken")) ? true : false;
	}
	hasAccessToken(){
		return this.accessTokenExists();
	}
}
const api = new apiConnector();
export default api;