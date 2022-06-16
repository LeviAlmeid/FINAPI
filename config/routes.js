const express = require('express')
const routes  = express.Router()

const { v4: uuidv4 } = require("uuid");



const customers = []; 

// Middwares

function verifyIfExistsAccountCPF(request, response, next){
    const { cpf, name } = request.headers;

    const customer = customers.find((customer) => customer.cpf === cpf);
 
    if(!customer){
        return response.status(400).json({error: "Customer not found"})
    }

    request.customer = customer;

    return next();
}

function getBalance(statement){
   const balance =  statement.reduce((acc, operation) => {
        if(operation.type === "credit"){
            return acc + operation.amount;
        }else{
            return acc - operation.amount;
        }
    }, 0);

    return balance;
}

routes.post("/account", (request, response) => {
    const { cpf, name } = request.body;

    const custmersAlreadyExists = customers.some((customers) => customers.cpf === cpf)

    if (custmersAlreadyExists) {
        return response.status(400).json({ error: "Customer already exists!" });
    }


    customers.push({
        cpf,
        name,
        id: uuidv4(),
        statement: [] 
    })

    return response.status(201).send(customers);
});


routes.get("/statement",verifyIfExistsAccountCPF, (request, response) => {
    const { customer } = request;



    return response.json(customer.statement );
});

routes.post("/deposit", verifyIfExistsAccountCPF, (request, response) =>{
    const { description, amount} = request.body;

    const {customer} = request;

    const statementOperation = {
        description,
        amount,
        createAt: new Date(),
        type: "credit"
    }

    customer.statement.push(statementOperation);

    return response.status(201).send();
});

routes.post("/withdraw", verifyIfExistsAccountCPF, (request, response) =>{
    const { amount } = request.body;
    const { customer } = request;
    

    const balance = getBalance(customer.statement);

    if(balance < amount){
        return response.status(400).json({error: "Insufficient funds!"})
    }

    const statementOperation = {
        amount,
        createAt: new Date(),
        type: "debit"
    }

    customer.statement.push(statementOperation);

    return response.status(201).send();
})


module.exports = routes