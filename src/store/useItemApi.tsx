import create from 'zustand'
import axios from 'axios'

export const useSearchApi = create((set) => ({
  books: [],
  fetch: async (searchTerm, tag, sort) => {
    const response = await axios(`/api/aladinItemSearch?s=ItemSearch&q=${searchTerm}&t=${tag}&sort=${sort}`)     
    set( { books: response.data.item}) 
  }
}))  


export const useListApi = create((set) => ({
  books: [],
  fetch: async () => {
    const response = await axios(`/api/aladinItemSearch?s=ItemList&qt=ItemNewAll`)
    set( {books: response.data.item})
  }
}))

export const useLookupApi = create((set) => ({
  books: [],
  fetch: async(id) => {
    const response = await axios(`/api/aladinItemSearch?s=ItemLookup&id=${id}`)
    set( { books: response.data.item})
  }
}))




// const { fetch, books } = useSearchApi()


//   useEffect(() => {
//     if (searchTerm && searchTerm.trim() !== '') {
//       // setLoading(true)
//       fetch(searchTerm, tag)
//       console.log(1)
//     }}, [fetch, searchTerm, tag])