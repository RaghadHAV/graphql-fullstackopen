
import { useMutation } from '@apollo/client';
import React from 'react'
import { UPDATE_AUTHOR, ALL_AUTHORS } from '../queries'
import Select from 'react-select';

const Authors = (props) => {

  const [name, setName] = React.useState(null);
  const [year, setYear] = React.useState('')
  const [editAuthor] = useMutation(UPDATE_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }]
  })

  if (!props.show) {
    return null
  }
  const authors = props.authors;
  // let options = [{ value: '1', label: '1' }]
  // let options = []
  // for (let i = 0; i < authors.length; i++) {
  //   console.log('the author name', authors[i].name)
  //   options.push({ value: authors[i].name, label: authors[i].name });
  //   // options[i].label : authors[i].name;

  // }
  const options = authors.map((author) => ({ value: author.name, label: author.name }));

  // const addName = (event) => {
  //   event.preventDefault();
  //   console.log(event.target.value)
  //   setName(event.target.value)
  // }

  const Addyear = (event) => {
    event.preventDefault();
    setYear(event.target.value)
  }

  const updateAuthor = (event) => {
    event.preventDefault()

    const yearInt = parseInt(year);
    editAuthor({
      variables: { name: name.value, setBornTo: yearInt }
    });

    setName(null);
    setYear('')
  }

  console.log("render", name, year)

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>
      <div>
        <h4> Add Author Birth Year</h4>

        {/* <select defaultValue={'blah'} onChange={addName}>
          {authors.map((a) =>
            <option key={a.id} value={a.name}>{a.name}</option>
          )}
        </select> */}

        <Select
          value={name}
          onChange={setName}
          options={options}
        />
        Born: <input value={year} type="text" onChange={Addyear} />
        <button onClick={updateAuthor}> Update Auther</button>
      </div>


    </div>
  )
}

export default Authors
