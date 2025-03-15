const grid = document.querySelector(".grid");
const cartHeading = document.querySelector(".cart__heading");
const cartElement = document.querySelector(".cart");
const cartPriceNumber = document.querySelector(".cart__price__number");
const confirmButton = document.querySelector(".confirm__btn");
const confirmList = document.querySelector(".confirm__list");
const cartConfirmTotalprice = document.querySelector(".cart__price__confirm");
const cartPriceWrapper = document.querySelector(".cart__price");
const carbonWrapper = document.querySelector(".carbon-wrapper");

const overlay = document.querySelector(".overlay");
const confirmContainer = document.querySelector(".confirm");

const newOrderBtn = document.querySelector(".new__order-btn");
const emptyCartWrapper = document.querySelector(".cart__empty__img__wrapper");

let buttons;

let products = [];
let cart = [];
let totalPrice = 0;
let totalQuantity = 0;

async function fetchProducts() {
  try {
    const response = await fetch("data.json");
    const data = await response.json();
    products = data;

    populateGrid(products.reverse());
    addToCartListeners();
  } catch (error) {
    console.error("Error loading products", error);
  }
}

fetchProducts();

function populateGrid(products) {
  for (let [i, product] of products.entries()) {
    product.quantity = 1;
    let gridItem = `
    <div class='grid__item'> 
      <div class='grid__image__container '>
        <img class='grid__product__img grid__image-${i}' src='${product.image.desktop}' alt='' />
        <button class='grid__cart__button' data-index="${i}" >
          <div class="grid__increment__container">
            <img class='grid__cart__minus__image' src="assets/images/icon-decrement-quantity.svg">
            <p> <span class="grid__quantity">1</span></p>
            <img class='grid__cart__plus__image' src="assets/images/icon-increment-quantity.svg">   
          </div>
          <img class='grid__cart__button__image' src="assets/images/icon-add-to-cart.svg" alt="">
          <p>Add to cart</p>
      </button>
        </div> 
          <p class='grid__product__category'>${product.category}</p> 
          <p class='grid__product__name'>${product.name}</p> 
          <p class='grid__product__price'>$${product.price}</p>
        </div>
        `;

    grid.insertAdjacentHTML("afterbegin", gridItem);
  }
}

function addToCartListeners() {
  buttons = document.querySelectorAll(".grid__cart__button");

  buttons.forEach((button) => {
    button.addEventListener("click", handleAddToCart);

    const plusIcon = button.querySelector(".grid__cart__plus__image");
    const minusIcon = button.querySelector(".grid__cart__minus__image");

    plusIcon.addEventListener("click", handleIncrement);
    minusIcon.addEventListener("click", handleDecrement);
  });

  confirmButton.addEventListener("click", handleConfirmOrder);
  newOrderBtn.addEventListener("click", startNewOrder);
}

function updateTotalPrice() {
  cartPriceNumber.textContent = "$" + totalPrice;
  cartPriceWrapper.style.opacity = 1;
  carbonWrapper.style.display = "block";
}

function hideCartImg() {
  emptyCartWrapper.style.display = "none";
}

function hideOrderTotal() {
  cartPriceWrapper.style.opacity = 0;
  carbonWrapper.style.display = "none";
}

function updateCartQuantity() {
  let allCartQuantities = document.querySelectorAll(".cart__list__quantity");
  totalQuantity = 0;

  for (let quantity of allCartQuantities) {
    let number = quantity.textContent.substring(0, 1);
    totalQuantity += parseInt(number);
  }

  cartHeading.textContent = `Your Cart (${totalQuantity})`;
}

function handleAddToCart(e) {
  e.stopPropagation();
  const { button, index, currentProduct, incrementContainer, quantityEl } =
    getCartData(e);

  // if (incrementContainer.style.opacity === "1") return;
  if (incrementContainer.style.display === "flex") return;

  let cartItem = populateCartItem(currentProduct, index);

  const selectedItem = document.querySelector(`.grid__image-${index}`);
  selectedItem.classList.add("img__border");

  cart.push(currentProduct);

  cartHeading.insertAdjacentHTML("afterend", cartItem);
  totalPrice += currentProduct.price;
  // incrementContainer.style.opacity = "1";
  incrementContainer.style.display = "flex";

  updateCartQuantity();
  updateTotalPrice();
  hideCartImg();

  const newCartItem = document.querySelector(
    `.cart__list[data-index="${index}"]`
  );
  const removeIcon = newCartItem.querySelector(".cart__list__image");
  removeIcon.addEventListener("click", function (e) {
    e.stopPropagation();

    newCartItem.remove();
    let quantity = parseInt(quantityEl.textContent);
    currentProduct.quantity = quantity;
    totalPrice -= (currentProduct.price * currentProduct.quantity).toFixed(2);

    const selectedItem = document.querySelector(`.grid__image-${index}`);
    selectedItem.classList.remove("img__border");

    cart = cart.filter((prod) => prod.name !== currentProduct.name);

    // reset button style in grid
    // incrementContainer.style.opacity = "0";
    incrementContainer.style.display = "none";
    const gridQuantityEl = button.querySelector(".grid__quantity");
    gridQuantityEl.textContent = "1";
    currentProduct.quantity = 1;

    updateCartQuantity();
    updateTotalPrice();

    const cartItem = document.querySelector(".cart__list");

    if (cartItem) return;

    emptyCartWrapper.style.display = "block";
    hideOrderTotal();
  });
}

function handleIncrement(e) {
  e.stopPropagation();
  const { index, currentProduct, quantityEl } = getCartData(e);

  let quantity = parseInt(quantityEl.textContent);
  quantity++;
  currentProduct.quantity = quantity;
  totalPrice += currentProduct.price;

  handleSidebarUI(currentProduct, quantityEl, quantity, index);
  updateCartQuantity();
}

function handleDecrement(e) {
  e.stopPropagation();
  const { index, currentProduct, quantityEl, incrementContainer } =
    getCartData(e);

  let quantity = parseInt(quantityEl.textContent);
  currentProduct.quantity = quantity;

  const selectedItem = document.querySelector(`.grid__image-${index}`);

  if (quantity > 1) {
    quantity--;
    currentProduct.quantity = quantity;
    totalPrice -= currentProduct.price;
    handleSidebarUI(currentProduct, quantityEl, quantity, index);
    updateCartQuantity();
  } else {
    selectedItem.classList.remove("img__border");
    // incrementContainer.style.opacity = 0;
    incrementContainer.style.display = "none";
    totalPrice -= (currentProduct.price * currentProduct.quantity).toFixed(2);

    const cartItemElem = document.querySelector(
      `.cart__list[data-index="${index}"]`
    );
    cartItemElem.remove();
    updateCartQuantity();
    updateTotalPrice();
    cart = cart.filter((prod) => prod.name !== currentProduct.name);

    const cartItem = document.querySelector(".cart__list");

    if (cartItem) return;

    emptyCartWrapper.style.display = "block";
    hideOrderTotal();
  }
}

function handleSidebarUI(currentProduct, quantityEl, quantity, index) {
  quantityEl.textContent = quantity;

  const cartItem = document.querySelector(`.cart__list[data-index="${index}"]`);
  const finalPrice = cartItem.querySelector(".final-price");
  const cartQuantityEl = cartItem.querySelector(".cart__list__quantity");

  cartQuantityEl.textContent = currentProduct.quantity + "x";
  finalPrice.textContent =
    "$" + (currentProduct.quantity * currentProduct.price).toFixed(2);
  cartPriceNumber.textContent = "$" + totalPrice;
}

function getCartData(e) {
  const button = e.currentTarget.closest(".grid__cart__button");
  const index = button.dataset.index;
  const currentProduct = products[index];
  const quantityEl = button.querySelector(".grid__quantity");
  const gridItem = e.currentTarget.closest(".grid__item");
  const incrementContainer = gridItem.querySelector(
    ".grid__increment__container"
  );
  return {
    button,
    index,
    currentProduct,
    quantityEl,
    gridItem,
    incrementContainer,
  };
}

function populateCartItem(currentProduct, index) {
  return `
    <ul class="cart__list" data-index='${index}' >
      <li class="cart__list__item">
        <div class="cart__list__text">
          <p class="cart__list__heading">${currentProduct.name}</p>
          <p class="cart__flex">
            <span class="cart__list__quantity">1x</span>     
            <span class="special-char">&#64;</span>
            <span class="product-price"> $${currentProduct.price}</span>   
            <span class="final-price">$${currentProduct.price}</span>
          </p>
        </div>
        <div class="cart__list__image__container">
          <img class="cart__list__image" src="assets/images/icon-remove-item.svg" alt="Remove">
        </div>
      </li>
    </ul>
  `;
}

function handleConfirmOrder(e) {
  for (let [i, item] of cart.entries()) {
    console.log(item);

    let cartItem = `
    <ul class="cart__list cart__confirm-list" data-index='${i}' >
      <li class="cart__list__item">
      <div class="cart__list__text__img__container">
        <img class="confirm__list__image"  src='${
          item.image.thumbnail
        }' alt='' />
          <div class="cart__list__text">
            <p class="cart__list__heading">${item.name}</p>
            <p class="cart__flex">
            <span class="cart__list__quantity">${item.quantity}</span>     
            <span class="special-char">&#64;</span>
            <span class="product-price"> $${item.price} </span>   
          </p>
          </div>
        </div>
        <p><span class="final-price">$${(item.price * item.quantity).toFixed(
          2
        )}</span></p>
      </li>
    </ul>
  `;

    confirmList.insertAdjacentHTML("afterbegin", cartItem);
  }
  let cartTotal = `
  <p class="cart__price__confirm__text">Order Total</p>
  <p class="cart__price__confirm__number">$${totalPrice}</p>
  `;
  cartConfirmTotalprice.insertAdjacentHTML("afterbegin", cartTotal);

  overlay.style.display = "block";
  confirmContainer.style.display = "block";
}

function startNewOrder() {
  totalPrice = 0;
  cart = [];
  overlay.style.display = "none";
  confirmContainer.style.display = "none";

  const allIncrementContainers = document.querySelectorAll(
    ".grid__increment__container"
  );
  const cartItems = document.querySelectorAll(".cart__list");
  const confirmList = document.querySelectorAll(".cart__confirm-list");
  const cartText = document.querySelector(".cart__price__confirm__text");
  const cartNumber = document.querySelector(".cart__price__confirm__number");
  const gridQuantityItems = document.querySelectorAll(".grid__quantity");

  for (let container of allIncrementContainers) {
    // container.style.opacity = 0;
    container.style.display = "none";
  }

  for (let item of cartItems) {
    item.remove();
  }

  for (let item of confirmList) {
    item.remove();
  }
  for (let item of gridQuantityItems) {
    item.textContent = "1";
  }

  cartText.remove();
  cartNumber.remove();

  updateCartQuantity();
  updateTotalPrice();

  emptyCartWrapper.style.display = "block";
  hideOrderTotal();

  const selectedItems = document.querySelectorAll(`.grid__product__img`);

  for (let item of selectedItems) {
    item.classList.remove("img__border");
  }
}
