import request from '@/utils/request.js'
export const ArticleCategoryListService = () => {
  return request.get('/category')
}

export const ArticleCategoryAddService = (categoryData) => {
  return request.post('/category', categoryData)
}

export const ArticleCategoryUpdateService = (categoryData) => {
  return request.put('/category',categoryData)
}

export const ArticleCategoryDeleteService = (id) => {
  return request.delete('/category?id='+id)
}

export const ArticleListService = (params)=>{
  return request.get('/article',{params:params})
}

export const ArticleAddService = (articleData)=>{
  return request.post('/article',articleData)
}
export const ArticleUpdateService = (articleData) => {
  return request.put('/article', articleData)
}

export const ArticleDeleteService = (id) => {
  return request.delete('/article?id=' + id)
}

