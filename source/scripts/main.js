'use strict';

const page = document.body;
const pageHeader = page.querySelector('#page-header');
const mainNav = pageHeader.querySelector('#main-nav');
const mobileNavButton = page.querySelector('#mobile-nav-button');

const toggleMobileNav = () => {
    mobileNavButton.classList.toggle('page-header__button--cross');
    mainNav.classList.toggle('main-nav__shown');
};

const onMobileNavButtonClick = () => {
    toggleMobileNav();
};
mobileNavButton.addEventListener('click', onMobileNavButtonClick);

const settingsToast = page.querySelector('#settings-toast');
let toastTimeout = null;

const hideToast = (toast) => {
    toast.classList.remove('toast--shown');

    clearTimeout(toastTimeout);
};

const showToast = (toast) => {
    if (toast.classList.contains('toast--shown')) {
        return;
    }

    toast.classList.add('toast--shown');

    toastTimeout = setTimeout(() => {
        toastClose.removeEventListener('click', onToastCloseClick);

        hideToast(toast);
    }, 3000);

    const toastClose = toast.querySelector('.toast__close');
    toastClose.addEventListener('click', onToastCloseClick);
};

const onToastCloseClick = (evt) => {
    hideToast(evt.target.parentElement);
};

const settingsButton = page.querySelector('#settings-button');

const onSettingsButtonCLick = (evt) => {
    evt.preventDefault();

    showToast(settingsToast);
};
settingsButton.addEventListener('click', onSettingsButtonCLick);
