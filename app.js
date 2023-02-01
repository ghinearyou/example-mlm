const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const dirModel = path.join(__dirname, '/data')

//Create data file
async function createData () {
  const models = ['member.txt']
  const list = fs.readdirSync(dirModel)

  models.map(async (file) => {
    if (!list.includes(file)) fs.appendFileSync(`${dirModel}/${file}`, '[]')
  })
}

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.post('/register', (req, res) => {
  try {
    const member = JSON.parse(fs.readFileSync(`${dirModel}/member.txt`, 'utf8'))
    const parent_id = req.query.id || 0
  
    if(!(parent_id % 1 === 0)) throw ("Id should be an int")
    
    const existMember = member.find(({ id }) => id == parent_id)
  
    if(!existMember && parent_id) throw ("Parent not found");
  
    member.push({
      id: member.length + 1,
      member_id: req.body.member_id,
      name: req.body.name,
      first_parent_id: parseInt(parent_id),
      second_parent_id: existMember ? parseInt(existMember.first_parent_id) : 0,
      level: existMember ? parseInt(existMember.level)+1 : 1
    })
  
    fs.writeFileSync(`${dirModel}/member.txt`, JSON.stringify(member))
    res.send('Member Created')  
  } catch (err) {
    res.send(err)
  }
});

app.get('/calculate/:id', (req, res) => {
  try {
    const searchId = req.params.id
    const member = JSON.parse(fs.readFileSync(`${dirModel}/member.txt`, 'utf8'))
    const resultMember = member.find(({id}) => id == searchId)

    if(!resultMember) throw ("Parent not found");

    const first_parent = member.filter(({first_parent_id}) => first_parent_id == searchId);
    const second_parent = member.filter(({second_parent_id}) => second_parent_id == searchId);

    resultMember.bonus = (first_parent.length * 1) + (second_parent.length * 0.5)
    res.send(resultMember)
  } catch (err) {
    res.send(err)
  }
})

app.put('/update-parent/:id', (req, res) => {
  try {
    const searchId = req.params.id
    const newParentId = req.body.parent_id

    const member = JSON.parse(fs.readFileSync(`${dirModel}/member.txt`, 'utf8'))
    const resultMember = member.findIndex(({id}) => id == searchId)
    const resultParent = member.findIndex(({id}) => id == newParentId)

    member[resultMember].first_parent_id = newParentId
    member[resultMember].second_parent_id = member[resultParent].first_parent_id

    member.map(each => {
      if(each.first_parent_id == searchId) each.second_parent_id = newParentId
    })

    fs.writeFileSync(`${dirModel}/member.txt`, JSON.stringify(member))

    res.send(member[resultMember])
  } catch (err) {
    res.send(err)
  }
})

app.listen(3000, async (req, res) => {
  await createData()
  console.log("Running on port 3000")
});