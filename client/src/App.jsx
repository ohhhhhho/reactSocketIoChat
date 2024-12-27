import { useEffect, useRef, useState } from 'react'
import {io} from 'socket.io-client'
import './index.css';

function App() {
  const [username, setUsername] = useState("")
  const [socket,setSocket] = useState(null)
  const [isConnected,setIsConnected] = useState(false)
  const [userMessage,setUserMessage] = useState("")
  const [messages, setMessages] = useState([])
  const messageListRef = useRef(null);

  //챗 연결됨
  const connectChat = () => {
      // 개발 환경과 프로덕션 환경 구분
      const socketUrl = import.meta.env.DEV 
      ? import.meta.env.VITE_SOCKET_URL  // 개발 환경
      : '';  // 프로덕션 환경에서는 현재 origin 사용
    //서버와 소켓 연결
    const socket_ = io(socketUrl,{ // 서버 주소
        //자동 연결 끔
        autoConnect:false,
        //소켓 연결시 함께 전송할 데이터(쿼리)
        query:{
          username
        }
    })
    //서버 연결 시작
    socket_.connect()
    //소켓 객체 저장
    setSocket(socket_)
  }
  //챗 연결 끊어졌을때
  const disconnectChat = () => {
    socket?.disconnect()
    setUsername("")
  }
  //접속 버튼 이벤트
  const onConnected = () => {
    setIsConnected(true)
  }
  //접속 종료 이벤트
  const disConnected = () => {
    setIsConnected(false)
  }
  //메세지 전송 버튼 클릭시 새로운 메세지 배열에 저장
  const onMessageReceived = (msg) => {
    setMessages(pre => [...pre,msg])
  }
  useEffect(() => {
    // 메시지가 추가될 때마다 messageListRef를 기준으로 스크롤 내리기
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);
  
  useEffect(() => {
    socket?.on('connect',onConnected)
    socket?.on('disconnect',disConnected)
    socket?.on('new message',onMessageReceived)
    return () => {
      socket?.off('connect',onConnected)
      socket?.off('disconnect',disConnected)
      socket?.off('new message',onMessageReceived)
    }
  },[socket])
  const sendMessageChat = (e) => {
    e.preventDefault();
    //서버에 메세지 보내기
    //보내고 싶은 데이터가 여러개일때 json형식으로 보낼 수 있다
    // socket?.emit("new message",userMessage, (res) => {
    if(userMessage !== ""){
      socket?.emit("new message",{message:userMessage,username})
      setUserMessage("")
    }
  }
  return (
    <>
      <div className='bg-neutral-900 *:text-neutral-100 w-3/4 fixed top-1/2 left-1/2 -translate-x-1/2  -translate-y-1/2 mx-auto h-5/6 shadow-xl p-4 box-border *:box-border *:text-sm rounded-xl'>
        <div className="flex flex-col h-full">
          <div className="flex flex-row gap-4 items-center flex-wrap">
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} maxLength={5} disabled={isConnected ? true : false} className='ring-1 ring-neutral-300 rounded-md h-8 bg-transparent'/>
            {isConnected ? null : 
              <button onClick={() => connectChat()} disabled={username ? false : true} className='bg-transparent ring-1 ring-neutral-300 p-1.5 px-4 hover:bg-neutral-50 hover:text-neutral-900 hover:transition-colors border-none'>
              접속하기
              </button>
            }
              <button onClick={() => disconnectChat()} className='bg-transparent ring-1 ring-neutral-300 p-1.5 px-4 hover:bg-neutral-50 hover:text-neutral-900 hover:transition-colors border-none'>
                접속종료
              </button>
              <span className={`text-neutral-600 ${isConnected && 'text-white'}`}>{username} {isConnected ? "온라인" : "오프라인"}</span>
          </div>
          <div className='flex-grow overflow-y-scroll mt-6 bg-neutral-800 mb-16'>
            <ul ref={messageListRef} className='flex flex-col  px-2'>
              {messages.map((msg, idx) => (
                <li key={idx} className='list-none'>{msg.username} : {msg.message}</li>
              ))}
            </ul>
          </div>
          <div className="fixed bottom-4 left-0 w-full px-4">
            <form onSubmit={sendMessageChat} className='flex flex-row justify-between w-full gap-4 flex-wrap'>
              <input type="text" value={userMessage} disabled={isConnected ? false : true} onChange={e => setUserMessage(e.target.value)} className='ring-1 ring-neutral-300 rounded-md flex-grow bg-transparent h-10'/>
              <button disabled={isConnected ? false : true} className='p-0 w-1/6 bg-transparent ring-1 ring-neutral-300 hover:bg-neutral-50 hover:text-neutral-900 hover:transition-colors border-none h-10'>
                  전송
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
