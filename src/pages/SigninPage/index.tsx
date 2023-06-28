import { API_HEADER } from '../../api/usersApi';
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAccountTokenStore from '../../store/useAccountTokenStore';
import Modal from 'antd/es/modal/Modal';

const SignInPage = (): JSX.Element => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const navigate = useNavigate();

  // Token 관리
  const { setLoginToken, setNickNameToken, setUserImgToken } = useAccountTokenStore((state) => ({
    setLoginToken: state.setLoginToken,
    setNickNameToken: state.setNickNameToken,
    setUserImgToken: state.setUserImgToken,
  }));

  // 이메일, 비밀번호 입력 형식 체크 상태 (errorMessage)
  const [emailValid, setEmailValid] = useState<boolean>(false);
  const [passwordValid, setPasswordValid] = useState<boolean>(false);

  // 형식 체크: 이메일 (@ 혹은 .이 들어가있지 않으면 false)
  const checkEmail = (e: ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
    const regex =
      /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
    if (regex.test(e.target.value)) {
      setEmailValid(true);
    } else setEmailValid(false);
  };

  // 형식 체크: 비밀번호 (8자 이하면 false)
  const checkPassword = (e: ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value);
    const regex =
      /^(?=.*[a-zA-Z])(?!.*[^a-zA-Z0-9$`~!@$!%*#^?&\\()\-=+])[a-zA-Z0-9$`~!@$!%*#^?&\\()\-=+]{8,}$/;
    if (regex.test(e.target.value)) {
      setPasswordValid(true);
    } else setPasswordValid(false);
  };

  // SignInAPI
  const signIn = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    const res = await fetch('https://asia-northeast3-heropy-api.cloudfunctions.net/api/auth/login', {
      method: 'POST',
      headers: {
        ...API_HEADER,
        Authorization: `Bearer ${localStorage.getItem('accountToken')}`,
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
    const json = await res.json();
    if (res.ok) {
      setLoginToken(json.accessToken);
      setNickNameToken(json.user.displayName);
      setUserImgToken(json.user.profileImg);
      navigate('/');
    } else {
      console.log(res.ok);
      setSuccessModalVisible(true); // 로그인 실패 시 모달 띄우기
    }
  };

  useEffect(() => {
    if (emailValid && passwordValid) {
      setNowAllow(false);
    } else setNowAllow(true);
  }, [emailValid, passwordValid]);

  // 로그인 인풋 확인 후 로그인 버튼 활성화 상태
  const [notAllow, setNowAllow] = useState<boolean>(true);

  // 모달 관리
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  // 모달 확인 버튼 클릭 시
  const handleModalOk = () => {
    setSuccessModalVisible(false);
  };

  return (
    <div>
      {/* title  */}
      <h1>로그인 페이지</h1>
      <div className="titleWrap">
        아이디와 비밀번호를
        <br />
        입력해주세요.
      </div>

      {/* content */}
      <div className="contentWrap">
        <div>이메일 주소</div>
        <form onSubmit={signIn}>
          {/* 이메일 */}
          <div className="input-id">
            <input
              type="text"
              className="input"
              placeholder="아이디"
              value={email}
              onChange={checkEmail}
            />
            {!emailValid && email.length > 0 && (
              <div
                style={{
                  color: 'red',
                }}>
                올바른 이메일 형식을 입력해주세요{' '}
              </div>
            )}
          </div>

          {/* 패스워드 */}
          <div>비밀번호</div>
          <div className="input-pw">
            <input
              className="input"
              placeholder="비밀번호"
              defaultValue={password}
              type="password"
              onChange={checkPassword}
            />
          </div>
          {!passwordValid && password.length > 0 && (
            <div
              style={{
                color: 'red',
              }}>
              비밀번호는 8자 이상입니다.
            </div>
          )}
          {/* 버튼 */}
          <div className="btn">
            <button className="login__btn" type="submit" disabled={notAllow}>
              로그인
            </button>
          </div>
          <hr />
          <div className="btn__toJoin">
            <Link to="/SignupPage">회원가입</Link>
          </div>
        </form>
      </div>

      <Modal
        title="로그인 오류"
        visible={successModalVisible}
        closable={false}
        onOk={handleModalOk}
        okText="확인"
        cancelButtonProps={{ style: { display: 'none' } }}>
        <p>이메일 혹은 비밀번호가 일치하지 않습니다.</p>
      </Modal>
    </div>
  );
};

export default SignInPage;
