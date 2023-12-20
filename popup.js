async function render(cookies) {
	let html = '';
	let promises = [];

	// render
	cookies.forEach((item) => {
		// fetch API
		item.chapters.forEach((chapter) => {
			const url = `https://cuutruyen.net/api/v2/chapters/${chapter}`;
			promises.push(
				new Promise((resolve, reject) => {
					fetch(url)
						.then((res) => res.json())
						.then(({ data }) => {
							resolve(data);
						})
						.catch((err) => reject(err));
				})
			);
		});
	});
	const data = await Promise.all(promises);
	// sorted aplabet (item.managa.name) and number (item.number)
	data.sort((a, b) => {
		if (a.manga.name > b.manga.name) return 1;
		if (a.manga.name < b.manga.name) return -1;
		if (parseFloat(a.number) > parseFloat(b.number)) return 1;
		if (parseFloat(a.number) < parseFloat(b.number)) return -1;
		return 0;
	});
	data.forEach((item, index) => {
		html += `
			<tr>
				<td>${index + 1}</td>
				<td>${item.manga.name}</td>
				<td>${item.number}</td>
		<td><a target="_blank" href="https://cuutruyen.net/mangas/${item.manga.id}/chapters/${
			item.id
		}">Nhấn để tới chapter</a></td>
			</tr>
			`;
	});
	return html;
}

const port = chrome.runtime.connect({ name: 'getCookies' });

port.onMessage.addListener(async function ({ cookies }) {
	if (cookies) {
		document.querySelector('tbody').innerHTML = await render(JSON.parse(cookies));
	}
});
