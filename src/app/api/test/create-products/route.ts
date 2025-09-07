import { NextResponse } from 'next/server';
import { getProductsClient } from '@/lib/supabase-multi';

export async function POST(): Promise<NextResponse> {
  try {
    const productsClient = getProductsClient();
    
    // First, create a sample category
    const { data: category, error: categoryError } = await productsClient
      .from('categories')
      .insert({
        name: 'Ethnic Wear',
        slug: 'ethnic-wear',
        is_active: true
      })
      .select()
      .single();

    if (categoryError && categoryError.code !== '23505') { // Ignore duplicate key error
      console.error('Category creation error:', categoryError);
      return NextResponse.json({
        success: false,
        error: categoryError.message
      }, { status: 500 });
    }

    // Use existing category if duplicate
    let categoryId = category?.id;
    if (!categoryId) {
      const { data: existingCategory } = await productsClient
        .from('categories')
        .select('id')
        .eq('slug', 'ethnic-wear')
        .single();
      categoryId = existingCategory?.id;
    }

    // Sample products data - using actual schema fields
    const sampleProducts = [
      {
        name: 'Elegant Silk Saree',
        slug: 'elegant-silk-saree',
        description: 'Beautiful handwoven silk saree with intricate patterns',
        price: 2999,
        category_id: categoryId,
        status: 'active',
        is_featured: true
      },
      {
        name: 'Traditional Lehenga Choli',
        slug: 'traditional-lehenga-choli',
        description: 'Stunning traditional lehenga with embroidered choli',
        price: 4999,
        category_id: categoryId,
        status: 'active',
        is_featured: true
      },
      {
        name: 'Designer Party Gown',
        slug: 'designer-party-gown',
        description: 'Elegant party gown perfect for special occasions',
        price: 4299,
        category_id: categoryId,
        status: 'active',
        is_featured: false
      }
    ];

    // Insert products
    const { data: products, error: productsError } = await productsClient
      .from('products')
      .insert(sampleProducts)
      .select();

    if (productsError && productsError.code !== '23505') { // Ignore duplicate key error
      console.error('Products creation error:', productsError);
      return NextResponse.json({
        success: false,
        error: productsError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Sample products created successfully',
      data: {
        category,
        products: products || 'Products already exist'
      }
    });

  } catch (error) {
    console.error('Error creating sample products:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
