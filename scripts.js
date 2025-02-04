let cart = JSON.parse(localStorage.getItem('cart')) || [];
let total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
}

function toggleCart() {
    document.querySelector('.cart-tab').classList.toggle('active');
}

function showCategory(categoryId) {
    document.querySelectorAll('.category').forEach(cat => {
        cat.classList.remove('active');
        cat.style.display = 'none';
    });

    const selected = document.getElementById(categoryId);
    if (selected) {
        selected.classList.add('active');
        selected.style.display = 'block';
    }
}

function addToCart(name, price) {
    const existing = cart.find(item => item.name === name);
    if (existing) {
        existing.quantity++;
        existing.total = existing.quantity * price;
    } else {
        cart.push({
            name,
            price,
            quantity: 1,
            total: price
        });
    }
    total += price;
    updateCart();
    saveCart();
}

function removeFromCart(index) {
    total -= cart[index].total;
    cart.splice(index, 1);
    updateCart();
    saveCart();
}

function decreaseQuantity(index, price, event) {
    event.stopPropagation(); // Impede a propagação do clique para evitar o fechamento do carrinho
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
        cart[index].total = cart[index].quantity * price;
        total -= price;
    } else {
        removeFromCart(index);
    }
    updateCart();
    saveCart();
}

function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartCount = document.getElementById('cart-count');

    cartItems.innerHTML = cart.length > 0 
        ? cart.map((item, index) => `
            <div class="cart-item">
                <div>
                    <h6 class="mb-0">${item.name} (${item.quantity}x)</h6>
                    <small>R$ ${item.total.toFixed(2)}</small>
                </div>
                <div class="d-flex">
                    <button class="btn btn-sm btn-secondary mr-2" onclick="decreaseQuantity(${index}, ${item.price}, event)">
                        <i class="fas fa-minus"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="removeFromCart(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('')
        : `<div class="text-center text-muted py-4">Carrinho vazio</div>`;

    cartTotal.textContent = `R$ ${total.toFixed(2)}`;
    cartCount.textContent = cart.reduce((acc, item) => acc + item.quantity, 0);
}

async function checkout() {
    const btn = document.querySelector('.checkout-btn');
    if (cart.length === 0) {
        btn.innerHTML = 'Carrinho Vazio!';
        setTimeout(() => updateCart(), 1000);
        return;
    }

    $('#checkoutModal').modal('show');
    btn.innerHTML = 'Finalizar Pedido <i class="fas fa-arrow-right ml-2></i>';
    btn.disabled = false;
}

function sendToWhatsApp() {
    const clientName = document.getElementById('clientName').value;
    const clientAddress = document.getElementById('clientAddress').value;
    const clientPhone = document.getElementById('clientPhone').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const orderNotes = document.getElementById('orderNotes').value;

    if (!clientName || !clientAddress || !clientPhone) {
        alert('Por favor, preencha todos os campos obrigatórios!');
        return;
    }

    let message = `*NOVO PEDIDO - CARDÁPIO DIGITAL* 🎉\n\n`;
    message += `*Cliente:* ${clientName}\n`;
    message += `*Endereço:* ${clientAddress}\n`;
    message += `*Telefone:* ${clientPhone}\n`;
    message += `*Pagamento:* ${paymentMethod}\n`;

    if (orderNotes) {
        message += `*Observações:* ${orderNotes}\n`;
    }

    message += `\n*ITENS DO PEDIDO:*\n`;
    cart.forEach((item, index) => {
        message += `\n${index + 1}. ${item.name}\n`;
        message += `   Quantidade: ${item.quantity}x\n`;
        message += `   Valor: R$ ${item.total.toFixed(2)}\n`;
    });

    message += `\n*TOTAL DO PEDIDO: R$ ${total.toFixed(2)}*`;
    message += `\n\nPor favor, confirme o recebimento deste pedido.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=5561994078277&text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    
    cart = [];
    total = 0;
    updateCart();
    saveCart();
    $('#checkoutModal').modal('hide');
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

document.addEventListener('DOMContentLoaded', () => {
    updateCart();
    showCategory('entradas');
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.sidebar') && !e.target.closest('.menu-toggle')) {
        document.querySelector('.sidebar').classList.remove('active');
    }

    if (!e.target.closest('.cart-tab') && !e.target.closest('.cart-tab-toggle')) {
        document.querySelector('.cart-tab').classList.remove('active');
    }
});
