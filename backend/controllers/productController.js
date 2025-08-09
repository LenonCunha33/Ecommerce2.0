import { v2 as cloudinary } from 'cloudinary';
import ProductModel from '../models/productModel.js';

export const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestseller,
    } = req.body;

    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];

    const images = [image1, image2, image3, image4].filter(Boolean);

    if (images.length === 0) {
      throw new Error('Por favor, carregue pelo menos uma imagem');
    }

    let imageUrl = await Promise.all(
      images.map(async (image) => {
        const result = await cloudinary.uploader.upload(image.path, {
          resource_type: 'image',
        });
        return result.secure_url;
      })
    );

    const productData = {
      name,
      description,
      price: Number(price),
      category,
      subCategory,
      sizes: JSON.parse(sizes),
      bestseller: bestseller === 'true',
      image: imageUrl,
      date: Date.now(),
      visible: true, // Campo padrão de visibilidade
    };

    const product = new ProductModel(productData);
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Produto Adicionado!',
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getListProducts = async (req, res) => {
  try {
    const products = await ProductModel.find();
    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeProduct = async (req, res) => {
  try {
    const id = req.body.id;
    const product = await ProductModel.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produto Não Encontrado!',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Produto Removido Com Sucesso',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSingleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await ProductModel.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produto Não Encontrado!',
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// NOVA: Atualizar informações do produto
export const updateProduct = async (req, res) => {
  try {
    const { id, name, category, price } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'ID do produto é obrigatório' });
    }

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      id,
      { name, category, price },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: 'Produto não encontrado' });
    }

    res.json({ success: true, message: 'Produto atualizado com sucesso', product: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// NOVA: Alterar visibilidade do produto
export const toggleVisibility = async (req, res) => {
  try {
    const { id, visible } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'ID do produto é obrigatório' });
    }

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      id,
      { visible },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: 'Produto não encontrado' });
    }

    res.json({ success: true, message: 'Visibilidade atualizada', product: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
