const testQuery = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: 'What is the procedure for clocking in late?'
          }
        ],
        clientId: 'f6e2afad-5d02-4338-b0d9-ab34199bab58'
      })
    })

    if (response.ok) {
      const data = await response.text()
      console.log('Success:', data)
    } else {
      const error = await response.text()
      console.error('Error:', response.status, error)
    }
  } catch (error) {
    console.error('Request failed:', error)
  }
}

testQuery() 