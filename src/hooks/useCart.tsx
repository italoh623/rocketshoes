import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');
    console.log(storagedCart)

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO
      const product = cart.find(product => product.id === productId);

      const stockResponse = await api.get(`stock/${productId}`);
      const stockAmount = stockResponse.data.amount;

      if (stockAmount <= 0) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      if (!product) {
        const productsResponse = await api.get(`products/${productId}`);

        const newProduct = {
          ...productsResponse.data,
          amount: 1
        }

        const newCart = [
          ...cart,
          newProduct
        ];

        setCart(newCart);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
      } else {
        if (product.amount < stockAmount) {

          const newCart = [...cart];
          const index = newCart.findIndex(product => product.id === productId);

          newCart[index].amount += 1 

          setCart(newCart);
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
        } else {
          toast.error('Quantidade solicitada fora de estoque');
        }
      }
    } catch {
      // TODO
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      const product = cart.find(product => product.id === productId);

      if (product) {
        const newCart = [...cart];
        const index = newCart.findIndex(product => product.id === productId);

        newCart.splice(index, 1);

        setCart(newCart);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
      } else {
        throw new Error();
      }

    } catch {
      // TODO
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      const stockResponse = await api.get(`stock/${productId}`);
      const stockAmount = stockResponse.data.amount;

      if (stockAmount <= 0 || stockAmount < amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      if (amount > 0) {
        const newCart = [...cart];
        const index = newCart.findIndex(product => product.id === productId);

        newCart[index].amount = amount;

        setCart(newCart);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
      } else {
        toast.error('Quantidade solicitada fora de estoque');
      }
    } catch {
      // TODO
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
