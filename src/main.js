import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import { getImagesByQuery } from './js/pixabay-api';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions';

const errorToastOptions = {
  position: 'topRight',
  theme: 'dark',
  backgroundColor: '#ef4040',
  messageColor: '#fff',
  iconColor: '#fff',
  progressBarColor: '#b51b1b',
  maxWidth: 432,
  messageSize: '16px',
  messageLineHeight: '24px',
};

const PER_PAGE = 15;

let searchQuery = '';
let page = 1;

const form = document.querySelector('.form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.btn-load-more');

form.addEventListener('submit', handleSubmit);
loadMoreBtn.addEventListener('click', handleLoadMore);

async function handleSubmit(event) {
  event.preventDefault();

  const query = event.currentTarget.elements['search-text'].value.trim();

  if (query === '') {
    iziToast.warning({
      message: 'Please enter a search query!',
      position: 'topRight',
    });
    return;
  }

  searchQuery = query;
  page = 1;

  clearGallery();
  hideLoadMoreButton();

  form.reset();

  await fetchImages();
}

async function fetchImages() {
  showLoader();
  hideLoadMoreButton();

  try {
    const data = await getImagesByQuery(searchQuery, page);

    if (data.hits.length === 0) {
      iziToast.error({
        ...errorToastOptions,
        message:
          'Sorry, there are no images matching your search query. Please try again!',
      });
      return false;
    }

    createGallery(data.hits);

    const loadedImages = page * PER_PAGE;

    if (loadedImages < data.totalHits) {
      showLoadMoreButton();
    } else {
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    }

    return true;
  } catch (error) {
    iziToast.error({
      ...errorToastOptions,
      message: 'Something went wrong. Please try again later.',
    });
    return false;
  } finally {
    hideLoader();
  }
}

function scrollToNewImages() {
  const card = gallery.querySelector('.gallery-item');

  if (!card) {
    return;
  }

  const cardHeight = card.getBoundingClientRect().height;

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

async function handleLoadMore() {
  page += 1;

  const isSuccess = await fetchImages();

  if (!isSuccess) {
    page -= 1;
    showLoadMoreButton();
    return;
  }

  scrollToNewImages();
}