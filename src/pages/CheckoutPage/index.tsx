import { useEffect, useState } from 'react'
import { Button, Card, Radio, Grid } from 'antd'
import { useCartStore } from '../../store/useCartStore'
import { useNavigate } from 'react-router-dom'
import { accountCheckAPI } from '../../api/accountApi'
import './CheckoutPage.css'

const { useBreakpoint } = Grid

const CheckoutPage = () => {
  const [totalPrice, setTotalPrice] = useState(0)
  const [bankAccounts, setBankAccounts] = useState([])
  const { selectedItems } = useCartStore()
  const navigate = useNavigate()
  const screen = useBreakpoint()

  const priceKr = price => {
    return <span>{`${price.toLocaleString('ko-KR')}원`}</span>
  }

  const handleTotalPrice = () => {
    const totalPrice = selectedItems.reduce((acc, book) => {
      const price = book.priceStandard
      return acc + price
    }, 0)
    setTotalPrice(totalPrice)
  }

  const fetchBankAccounts = async () => {
    try {
      const data = await accountCheckAPI()
      if (data && data.accounts) {
        setBankAccounts(data.accounts)
      }
    } catch (error) {
      console.error('Fetching bank accounts failed:', error)
    }
  }

  useEffect(() => {
    handleTotalPrice()
    fetchBankAccounts()
  }, [selectedItems])

  const handlePayment = () => {
    // Handle payment logic here
    console.log('Payment initiated')
  }

  const handleBankAccountSelect = accountId => {
    // Handle selection of bank account
    console.log('Selected bank account:', accountId)
  }

  return (
    <div className="checkout-page">
      <div className="left-section">
        <h1>주문/결제</h1>
        <Card
          className="left-section__items"
          title={`주문상품 총 ${selectedItems.length} 개`}>
          <div className="checkout-content">
            {selectedItems.map((book, index) => (
              <div
                key={index}
                className={`book-item ${
                  screen.xs ? 'book-item-xs' : 'book-item-sm'
                }`}>
                <img
                  src={book.cover}
                  alt={book.title}
                  style={{ width: '100px' }}
                />
                <p
                  style={{
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: '2',
                    overflow: 'hidden'
                  }}>
                  {book.title}
                </p>
                <p>{priceKr(book.priceStandard)}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card
          className="left-section__payment"
          title="결제 수단">
          <div className="payment-selection">
            <p>오북페이</p>
          </div>
          <div className="bank-account-list">
            {bankAccounts.length > 0 ? (
              <Radio.Group
                onChange={e => handleBankAccountSelect(e.target.value)}>
                {bankAccounts.map(account => (
                  <Radio
                    key={account.id}
                    value={account.id}>
                    <div>
                      <p>{`${account.bankName} - ${account.accountNumber}`}</p>
                    </div>
                  </Radio>
                ))}
              </Radio.Group>
            ) : (
              <p>사용 가능한 은행 계좌가 없습니다. 계좌를 연결해주세요.</p>
            )}
          </div>
        </Card>
      </div>
      <div className="checkout-sidebar">
        <div className="sidebar-content">
          <div className="total-price-container">
            <h2>최종 결제 금액</h2>
            <h2>{priceKr(totalPrice)}</h2>
          </div>
          <Button
            type="primary"
            size="large"
            style={{ width: '80%' }}
            onClick={handlePayment}>
            결제하기
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
