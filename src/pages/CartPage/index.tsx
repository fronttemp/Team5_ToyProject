import React, { useEffect, useState } from 'react'
import { Table, Input, Button, Space, Checkbox } from 'antd'
import { useCartStore } from '../../store/useCartStore'
import { useNavigate } from 'react-router-dom'
import ConfirmModal from '../../components/ConfirmModal'
import { logCheckAPI } from '../../api/usersApi'

const CartPage = () => {
  const [selectAll, setSelectAll] = useState(true)
  const [selectedItems, setSelectedItems] = useState([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isRemoveSelectedModalVisible, setIsRemoveSelectedModalVisible] =
    useState(false)
  const [isNoItemSelectedModalVisible, setIsNoItemSelectedModalVisible] =
    useState(false)
  const [isSignInRedirectModalVisible, setIsSignInRedirectModalVisible] =
    useState(false)

  const {
    bookCart,
    removeBook,
    saveSelectedItems,
    removeSelectedBooks
  } = useCartStore()
  const navigate = useNavigate()

  const priceKr = price => {
    return <span>{`${price.toLocaleString('ko-KR')} 원`}</span>
  }

  const handleSelect = (itemId, checked) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId])
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId))
      setSelectAll(false)
    }
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([])
    } else {
      setSelectedItems(bookCart.map(book => book.id))
    }
    setSelectAll(!selectAll)
  }

  const handleTotalPrice = () => {
    const totalPrice = selectedItems.reduce((acc, id) => {
      const book = bookCart.find(book => book.id === id)
      const price = book.priceStandard
      return acc + price
    }, 0)
    setTotalPrice(totalPrice)
  }

  const handleRemoveBook = book => {
    removeBook(book)
  }

  const handleRemoveSelected = () => {
    setIsRemoveSelectedModalVisible(true)
  }


  const onRemoveSelectedConfirm = confirm => {
    if (confirm) {
      removeSelectedBooks(selectedItems)
      setSelectedItems([])
    }
    setIsRemoveSelectedModalVisible(false)
  }

  const handleOrder = async () => {
    if (selectedItems.length === 0) {
      setIsNoItemSelectedModalVisible(true)
      return
    }

    const loginToken = JSON.parse(localStorage.getItem('accountToken')).state.loginToken;
    
    if (!loginToken) {
      setIsSignInRedirectModalVisible(true)
      return
    }

    try {
      const userInfo = await logCheckAPI(loginToken)
      if (userInfo.error) {
        setIsSignInRedirectModalVisible(true)
        return
      }

      setIsModalVisible(true)
    } catch (error) {
      console.error(error)
      setIsSignInRedirectModalVisible(true)
    }
  }

  const onConfirm = confirm => {
    if (confirm) {
      saveSelectedItems(selectedItems)
      navigate('/Checkout')
    }
    setIsModalVisible(false)
  }

  useEffect(() => {
    setSelectedItems(bookCart.map(book => book.id))
  }, [])

  useEffect(() => {
    setSelectedItems(prevSelectedItems => {
      const updatedSelectedItems = prevSelectedItems.filter(id =>
        bookCart.some(book => book.id === id)
      )
      if (updatedSelectedItems.length !== prevSelectedItems.length) {
        setSelectAll(false)
      }
      return updatedSelectedItems
    })
  }, [bookCart])

  useEffect(() => {
    handleTotalPrice()
    if (selectedItems.length !== bookCart.length) {
      setSelectAll(false)
    } else {
      setSelectAll(true)
    }
  }, [selectedItems])

  const moveDetailPage = (value: string) => {
    navigate('/Detail', { state: { value } })
  }

  const dataSource = bookCart.map((book, index) => ({
    key: index,
    name: (<div onClick={() => moveDetailPage(book.isbn)}>{book.title.length > 20 ? book.title.slice(0,19)+'...' : book.title}</div>),
    cover: (
      <img
        src={book.cover}
        alt={book.title}
        style={{ width: '50px' }}
        onClick={() => {
          moveDetailPage(book.isbn)
        }}
      />
    ),
    isbn: book.isbn,
    price: priceKr(book.priceStandard),
    action: (
      <Button
        onClick={() => {
          handleRemoveBook(book)
        }}>
        삭제
      </Button>
    ),
    select: (
      <Checkbox
        checked={selectedItems.includes(book.id)}
        onChange={e => handleSelect(book.id, e.target.checked)}
      />
    )
  }))

  const columns = [
    {
      title: (
        <Checkbox
          onChange={handleSelectAll}
          checked={selectAll}
        />
      ),
      dataIndex: 'select',
      key: 'select'
    },
    {
      title: '책 커버',
      dataIndex: 'cover',
      key: 'cover'
    },
    {
      title: '제목',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: <div style={{ textAlign: 'center', width:'80px'}}>가격</div>,
      dataIndex: 'price',
      key: 'price',
      align: 'right'
    },
    {
      title: <Button onClick={handleRemoveSelected}>선택삭제</Button>,
      dataIndex: 'action',
      key: 'action',
      align: 'center'
    }
  ]

  return (
    <section className="cart-page">
      <div className="cart-content">
        <div className="page_title">{`장바구니 (${selectedItems.length})`}</div>
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={false}
        />
      </div>
      <div className="sidebar">
        <div className="sidebar-content">
          <div className="total-price-container">
            <div className='total-price-title'>결제 예정 금액</div>
            <div className='total-price'>{priceKr(totalPrice)}</div>
          </div>
          <Button
            type="primary"
            size="large"
            onClick={handleOrder}>
            {`주문하기 (${selectedItems.length})`}
          </Button>
          <ConfirmModal
            content={`${selectedItems.length} 개의 상품을 주문하시겠습니까?`}
            onConfirm={onConfirm}
            open={isModalVisible}
            setConfirmVisible={setIsModalVisible}
          />
          <ConfirmModal
            content={`선택된 ${selectedItems.length} 개의 상품을 삭제하시겠습니까?`}
            onConfirm={onRemoveSelectedConfirm}
            open={isRemoveSelectedModalVisible}
            setConfirmVisible={setIsRemoveSelectedModalVisible}
          />
          <ConfirmModal
            content="주문할 상품을 선택해주세요"
            onConfirm={() => setIsNoItemSelectedModalVisible(false)}
            open={isNoItemSelectedModalVisible}
            setConfirmVisible={setIsNoItemSelectedModalVisible}
            showCancelButton={false}
          />
          <ConfirmModal
            content="로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?"
            onConfirm={() => navigate('/signInPage')}
            open={isSignInRedirectModalVisible}
            setConfirmVisible={setIsSignInRedirectModalVisible}
          />
        </div>
      </div>
    </section>
  )
}

export default CartPage
