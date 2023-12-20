/* // !!! BIẾN CỤC BỘ, ĐỪNG NGHỊCH NẾU BẠN KHÔNG PHẢI CODER ĐÃ HỌC QUA !!! // */
const global = {
	nameStore: 'cuutruyenExtension',
	apiCheck: 'https://cuutruyen.net/api/v2/chapters/',
	done: false,
};

function checkCorrectPage(link) {
	const regex = /https:\/\/cuutruyen.net\/mangas\/.*\/chapters\/.*/;
	return regex.test(link);
}

async function checkCorrectChapter(chapter) {
	return await fetch(global.apiCheck + chapter).then((res) => res.json());
}

function AllCookie() {
	const cookies = document.cookie.split(';');
	const obj = {};
	cookies.forEach((cookie) => {
		const [key, value] = cookie.split('=');
		obj[key.trim()] = value;
	});
	return obj;
}

const DataExt = () => (AllCookie()[global.nameStore] ? JSON.parse(AllCookie()[global.nameStore]) : []);

function processLink(link) {
	const regex = /https:\/\/cuutruyen.net\/mangas\/(?<manga>.*)\/chapters\/(?<chapter>.*)/;
	try {
		const { manga, chapter } = regex.exec(link).groups;
		return { manga, chapter };
	} catch (error) {
		return { manga: 0, chapter: 0 };
	}
}

function processData(manga, chapter) {
	const data = DataExt();
	const index = data.findIndex((item) => item.manga === manga);
	if (index === -1) {
		data.push({ manga, chapters: [chapter] });
	} else {
		const indexChapter = data[index].chapters.findIndex((item) => item === chapter);
		if (indexChapter === -1) {
			data[index].chapters.push(chapter);
		}
	}
	document.cookie = `${global.nameStore}=${JSON.stringify(data)};path=/`;
}

function hasReaded(manga, chapter) {
	const data = DataExt();
	const index = data.findIndex((item) => item.manga === manga);
	if (index === -1) return false;
	const indexChapter = data[index].chapters.findIndex((item) => item === chapter);
	return indexChapter !== -1;
}

function process(manga, chapter) {
	processData(manga, chapter);
	const titleChapter = document.querySelector('#heading > div > div.mb-12.flex-grow > h1 > span');
	if (hasReaded(manga, chapter) && titleChapter) {
		titleChapter.innerHTML = `${titleChapter.innerHTML} <span style="color: red">(Đã đọc)</span>`;
		global.done = true;
	}
}

function run(link) {
	const { manga, chapter } = processLink(link);
	checkCorrectChapter(chapter).then((res) => res.data && process(manga, chapter));
}

function checkHrefChanges() {
	let previousHref = window.location.href;

	const observer = new MutationObserver(() => {
		const currentHref = window.location.href;
		const currentBodyStyle = {
			position: window.getComputedStyle(document.body).position,
			top: window.getComputedStyle(document.body).top,
		};

		if (currentBodyStyle.position === 'static' && currentBodyStyle.top === 'auto') {
			console.log(`Href changed: ${previousHref} to ${currentHref}`);
			const hrefUsed = checkCorrectPage(currentHref) ? currentHref : previousHref;
			if (checkCorrectPage(currentHref) || (checkCorrectPage(previousHref) && !global.done)) run(hrefUsed);
			if (previousHref !== currentHref) global.done = true;
			previousHref = currentHref;
			initialBodyStyle = currentBodyStyle;
			// console.clear();
		}
	});

	const config = { attributes: true, childList: false };
	observer.observe(document.body, config);
}

checkHrefChanges();
