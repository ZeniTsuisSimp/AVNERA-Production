import { supabase, Product, Category } from './supabase'

export class ProductsService {
  // Get all products with filtering and pagination
  static async getProducts({
    page = 1,
    limit = 12,
    category,
    search,
    featured,
    sortBy = 'created_at',
    sortOrder = 'desc',
  }: {
    page?: number
    limit?: number
    category?: string
    search?: string
    featured?: boolean
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  } = {}) {
    let query = supabase
      .from('products')
      .select(`
        *,
        images:product_images(*),
        category:categories(*),
        variants:product_variants(*)
      `)
      .eq('status', 'active')

    // Apply filters
    if (category) {
      query = query.eq('category.slug', category)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (featured) {
      query = query.eq('is_featured', true)
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: products, error, count } = await query

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`)
    }

    return {
      products: products || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
        hasNext: page * limit < (count || 0),
        hasPrev: page > 1,
      },
    }
  }

  // Get single product by slug
  static async getProductBySlug(slug: string) {
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        images:product_images(*),
        category:categories(*),
        variants:product_variants(*)
      `)
      .eq('slug', slug)
      .eq('status', 'active')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Product not found
      }
      throw new Error(`Failed to fetch product: ${error.message}`)
    }

    return product
  }

  // Create new product (admin only)
  static async createProduct(productData: Partial<Product>) {
    const { data: product, error } = await supabase
      .from('products')
      .insert([productData])
      .select(`
        *,
        images:product_images(*),
        category:categories(*)
      `)
      .single()

    if (error) {
      throw new Error(`Failed to create product: ${error.message}`)
    }

    return product
  }

  // Get categories
  static async getCategories() {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`)
    }

    return categories || []
  }

  // Get featured products
  static async getFeaturedProducts(limit = 6) {
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        images:product_images(*),
        category:categories(*)
      `)
      .eq('status', 'active')
      .eq('is_featured', true)
      .limit(limit)

    if (error) {
      throw new Error(`Failed to fetch featured products: ${error.message}`)
    }

    return products || []
  }
}

// Sample data for development (when no database is connected)
export const sampleProducts = [
  {
    id: '1',
    name: 'Elegant Silk Saree',
    slug: 'elegant-silk-saree',
    description: 'Beautiful silk saree perfect for special occasions',
    price: 2999,
    compare_at_price: 3999,
    category_id: '1',
    status: 'active' as const,
    is_featured: true,
    images: [
      {
        id: '1',
        product_id: '1',
        url: 'https://picsum.photos/600/800?random=1',
        alt_text: 'Elegant Silk Saree',
        sort_order: 0,
        is_main: true,
      },
    ],
    category: {
      id: '1',
      name: 'Sarees',
      slug: 'sarees',
    },
    variants: [
      {
        id: '1-1',
        product_id: '1',
        name: 'Red - Free Size',
        quantity: 5,
        options: { color: 'Red', size: 'Free Size' },
        is_active: true,
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Designer Kurti Set',
    slug: 'designer-kurti-set',
    description: 'Trendy kurti set for modern women',
    price: 1899,
    compare_at_price: 2499,
    category_id: '2',
    status: 'active' as const,
    is_featured: true,
    images: [
      {
        id: '2',
        product_id: '2',
        url: 'https://picsum.photos/600/800?random=2',
        alt_text: 'Designer Kurti Set',
        sort_order: 0,
        is_main: true,
      },
    ],
    category: {
      id: '2',
      name: 'Kurtis',
      slug: 'kurtis',
    },
    variants: [
      {
        id: '2-1',
        product_id: '2',
        name: 'Pink - M',
        quantity: 4,
        options: { color: 'Pink', size: 'M' },
        is_active: true,
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Traditional Lehenga Choli',
    slug: 'traditional-lehenga-choli',
    description: 'Stunning lehenga choli for weddings and festivals',
    price: 4999,
    compare_at_price: 6999,
    category_id: '3',
    status: 'active' as const,
    is_featured: true,
    images: [
      {
        id: '3',
        product_id: '3',
        url: 'https://picsum.photos/600/800?random=3',
        alt_text: 'Traditional Lehenga Choli',
        sort_order: 0,
        is_main: true,
      },
    ],
    category: {
      id: '3',
      name: 'Lehengas',
      slug: 'lehengas',
    },
    variants: [
      {
        id: '3-1',
        product_id: '3',
        name: 'Gold - M',
        quantity: 2,
        options: { color: 'Gold', size: 'M' },
        is_active: true,
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Designer Party Gown',
    slug: 'designer-party-gown',
    description: 'Elegant party gown for special occasions',
    price: 4299,
    compare_at_price: 5499,
    category_id: '4',
    status: 'active' as const,
    is_featured: true,
    images: [
      {
        id: '4',
        product_id: '4',
        url: 'https://picsum.photos/600/800?random=4',
        alt_text: 'Designer Party Gown',
        sort_order: 0,
        is_main: true,
      },
    ],
    category: {
      id: '4',
      name: 'Gowns',
      slug: 'gowns',
    },
    variants: [
      {
        id: '4-1',
        product_id: '4',
        name: 'Black - M',
        quantity: 3,
        options: { color: 'Black', size: 'M' },
        is_active: true,
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]
