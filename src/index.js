export default {
	async fetch(request, env) {
		return await handleRequest(request).catch((err) => new Response(err.stack, { status: 500 }));
	},
};

var domain = 'support-jules';
var key = 'dW5ibG9ja2VyK2p1bGVzLTFAdW5ibG9jay5pby90b2tlbjpTVjk3azZzclZHQnptQkZPZjA0VzN3cUdRUFJ0R2RIcm9wRVA2VDdF';

/**
 * Many more examples available at:
 *   https://developers.cloudflare.com/workers/examples
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function handleRequest(request) {
	const { pathname } = new URL(request.url);

	if (pathname.startsWith('/api')) {
		var json = await request.json();
		console.log(json);
		var newTicketTitle = '';
		var newCivilite = '';
		var newNom = '';
		var newPreNom = '';
		var newLanguage = '';
		var newOrderNumber = '';
		var newMessage = '';
		var description = json.description.replaceAll('--', '');
		// var newNote = description;
		var ticketId = 0;

		ticketId = json.ticket_id;

		description = description.split('\n');
		var params = {};

		for (var x = 0; x < description.length; x++) {
			if (description[x] === '') {
				description.splice(x, 1);
			}
		}
		for (var i = 0; i < description.length; i++) {
			params[i] = description[i].split(' : ');
		}

		for (var z = 0; z < description.length; z++) {
			console.log(params[z][0]);
			console.log(params[z][1]);

			if (params[z][0] == 'Langage') {
				newLanguage = params[z][1];
				if (params[z][1] == 'fr_FR') {
					newLanguage = 'France';
				}
				if (params[z][1] == 'fr_BE') {
					newLanguage = 'Belgique FR';
				}
				if (params[z][1] == 'nl_BE') {
					newLanguage = 'Belgique NL';
				}
			}
			if (params[z][0] == 'Numero de commande') {
				newOrderNumber = params[z][1];
			}
			if (params[z][0] == 'Nom') {
				newNom = params[z][1];
			}
			if (params[z][0] == 'Civilité') {
				newCivilite = params[z][1];
			}
			if (params[z][0] == 'Prénom') {
				newPreNom = params[z][1];
			}

			if (params[z][0] == 'Message') {
				newMessage = params[z][1];
			}

			if (params[z][0] == 'Object') {
				if (params[z][1].includes('Passer commande')) {
					newTicketTitle = "Votre demande concernant le passage d'une commande";
				} else if (params[z][1].includes('Ma commande et ma livraison')) {
					newTicketTitle = "Votre demande concernant le passage d'une commande";
				} else if (params[z][1].includes('Mon retour ou remboursement')) {
					newTicketTitle = 'Votre demande concernant un retour/remboursement';
				} else if (params[z][1].includes('Mes avantages fidélité')) {
					newTicketTitle = 'Votre demande concernant vos avantages fidélité';
				} else if (params[z][1].includes('Mon compte client')) {
					newTicketTitle = 'Votre demande concernant votre compte client';
				} else if (params[z][1].includes('Ma carte cadeau')) {
					newTicketTitle = 'Votre demande concernant votre carte cadeau';
				} else if (params[z][1].includes('Magasin')) {
					newTicketTitle = 'Votre demande concernant nos magasins';
				} else if (params[z][1].includes('Recrutement')) {
					newTicketTitle = 'Votre demande concernant le recrutement';
				} else if (params[z][1].includes('Avis')) {
					newTicketTitle = 'Votre demande concernant votre avis';
				} else if (params[z][1].includes('Service')) {
					newTicketTitle = 'Votre demande concernant nos services';
				} else if (params[z][1].includes('Protection des données personnelles')) {
					newTicketTitle = 'Votre demande concernant  vos données personnelles';
				} else if (params[z][1].includes('Een bestelling plaatsen')) {
					newTicketTitle = 'Uw vraag over het plaatsen van een bestelling';
				} else if (params[z][1].includes('Mijn bestelling en mijn levering')) {
					newTicketTitle = 'Uw vraag over mijn bestelling en mijn levering';
				} else if (params[z][1].includes('Mijn retournering of terugbetaling')) {
					newTicketTitle = 'Uw vraag over mijn retournering of terugbetaling';
				} else if (params[z][1].includes('Mijn getrouwheidsvoordelen')) {
					newTicketTitle = 'Uw vraag over mijn getrouwheidsvoordelen';
				} else if (params[z][1].includes('Mijn klantaccount')) {
					newTicketTitle = 'Uw vraag over mijn klantaccount';
				} else if (params[z][1].includes('Mijn cadeaubon')) {
					newTicketTitle = 'Uw vraag over mijn cadeaubon';
				} else if (params[z][1].includes('Winkel')) {
					newTicketTitle = 'Uw vraag over een winkel';
				} else if (params[z][1].includes('Rekrutering')) {
					newTicketTitle = 'Uw vraag over rekrutering';
				} else if (params[z][1].includes('Mening')) {
					newTicketTitle = 'Uw vraag over uw beoordeling';
				} else if (params[z][1].includes('Diensten')) {
					newTicketTitle = 'Uw vraag over onze diensten';
				} else if (params[z][1].includes('Bescherming van persoonsgegevens')) {
					newTicketTitle = 'Uw vraag over bescherming van persoonsgegevens';
				}
			}
		}

		await updateTicket(ticketId, newTicketTitle, newMessage, newCivilite, newLanguage, newOrderNumber);

		console.log(params);
		console.log([newTicketTitle, newCivilite, newLanguage, newNom, newPreNom, newOrderNumber]);

		var comments = await listComments(ticketId);
		var last_comment = comments.comments[0];
		// await updateUser(userId, newNom, newPreNom);
		var ticket = await getTicket(ticketId);
		var userId = ticket.ticket.requester_id;
		console.log(last_comment);
		await makeCommentPrivate(ticketId, last_comment.id);

		await addNewComment(ticketId, newMessage);
		await updateUser(userId, newNom, newPreNom, newCivilite);

		return new Response(JSON.stringify({ pathname }), {
			headers: { 'Content-Type': 'application/json' },
		});
	}

	return fetch('https://welcome.developers.workers.dev');
}

async function updateTicket(ticketId, newTicketTitle, newMessage, newCivilite, newLanguage, newOrderNumber) {
	var civiliteField = '1900002575273';
	var languageField = '360026928257';
	var orderField = '360018510898';
	let headers = {
		'Content-Type': 'application/json',
		Authorization: 'Basic ' + key,
	};
	var body = {
		ticket: {
			subject: newTicketTitle,
			custom_fields: [
				{
					id: languageField,
					value: newLanguage,
				},
				{
					id: orderField,
					value: newOrderNumber,
				},
			],
		},
	};
	const init = {
		method: 'PUT',
		headers: headers,
		body: JSON.stringify(body),
	};
	var url = 'https://' + domain + '.zendesk.com/api/v2/tickets/' + ticketId + '.json';

	const result = await fetch(url, init);
}

async function listComments(ticketId) {
	let headers = {
		'Content-Type': 'application/json',
		Authorization: 'Basic ' + key,
	};
	const init = {
		method: 'GET',
		headers: headers,
	};
	var url = 'https://' + domain + '.zendesk.com/api/v2/tickets/' + ticketId + '/comments.json';
	const result = await fetch(url, init);

	return await result.json();
}

async function makeCommentPrivate(ticketId, commentId) {
	console.log(ticketId, commentId);
	let headers = {
		'Content-Type': 'application/json',
		Authorization: 'Basic ' + key,
	};
	const init = {
		method: 'PUT',
		headers: headers,
	};
	var url = 'https://' + domain + '.zendesk.com/api/v2/tickets/' + ticketId + '/comments/' + commentId + '/make_private.json';
	var result = await fetch(url, init);
}

async function addNewComment(ticketId, newNote) {
	let headers = {
		'Content-Type': 'application/json',
		Authorization: 'Basic ' + key,
	};
	var body = {
		ticket: {
			comment: { body: newNote, author_id: 386375398357, public: true },
		},
	};
	const init = {
		method: 'PUT',
		headers: headers,
		body: JSON.stringify(body),
	};
	var url = 'https://' + domain + '.zendesk.com/api/v2/tickets/' + ticketId + '.json';
	var result = await fetch(url, init);

	return await result.json();
}

async function getTicket(ticketId) {
	let headers = {
		'Content-Type': 'application/json',
		Authorization: 'Basic ' + key,
	};
	const init = {
		method: 'GET',
		headers: headers,
	};
	var url = 'https://' + domain + '.zendesk.com/api/v2/tickets/' + ticketId + '.json';
	const result = await fetch(url, init);

	return await result.json();
}

async function updateUser(userId, newNom, newPreNom, newCivilite) {
	let headers = {
		'Content-Type': 'application/json',
		Authorization: 'Basic ' + key,
	};
	console.log('newCivilite', newCivilite);
	var body = {
		user: {
			name: newNom + ', ' + newPreNom,
			user_fields: {
				civilite: newCivilite,
			},
		},
	};
	const init = {
		method: 'PUT',
		headers: headers,
		body: JSON.stringify(body),
	};
	var url = 'https://' + domain + '.zendesk.com/api/v2/users/' + userId + '.json';
	var result = await fetch(url, init);

	return await result.json();
}
