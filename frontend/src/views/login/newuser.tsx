import React, {useState} from 'react'

function NewUser()
{
	const [name, setName] = useState('')
	const [pfp, setPFP] = useState('')
	return
	(
		<form>
			<label>
				Name:
				<input type="text" value={name} onChange={(e) => setName(e.target.value)} />
			</label>
		</form>
	)
}

export default NewUser;