const ganache = require('ganache');
const { Web3 } = require('web3');
const web3 = new Web3(ganache.provider())
const { interface: contractInterface, bytecode } = require("../compile")

describe("Lottery contract", () => {
    let accounts;
    let lotteryContract;

    beforeEach(async () => {
        accounts = await web3.eth.getAccounts();
        lotteryContract = await new web3.eth.Contract(JSON.parse(contractInterface))
            .deploy({ data: bytecode })
            .send({ from: accounts[0], gas: "1000000" })
    })

    it("Should be deployed contract", () => {
        expect(lotteryContract.options.address).not.toBe(null)
    })

    it("Should be valid if manager is how deployed contract", async () => {
        const manager = await lotteryContract.methods.manager().call()
        expect(manager).toBe(accounts[0])
    })

    it("Should be call method enter, but pass ether", async () => {
        try {
            await lotteryContract.methods.enter().send({
                from: accounts[1],
                value: 0
            })
            expect(true).toBe(false)
        } catch (error) {
            expect(true).toBe(true)
        }
    })

    it("Should be call method enter with success", async () => {
        await lotteryContract.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei(1, 'ether')
        });
        const players = await lotteryContract.methods.getPlayers().call()
        expect(players.length).toBe(1)
    })

    it("Should be throw exception when try call method pickerWinner, because only manager can call this method", async () => {
        try {
            await lotteryContract.methods.pickWinner().send({
                from: accounts[1],
            });
            expect(true).toBe(false)
        } catch (error) {
            expect(true).toBe(true)
        }
    })

    it("Should be call method pickerWinner success", async () => {
        await lotteryContract.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei(2, "ether")
        })

        const initalBalance = await web3.eth.getBalance(accounts[1])
        await lotteryContract.methods.pickWinner().send({
            from: accounts[0],
        });
        const finalBalance = await web3.eth.getBalance(accounts[1])
        const difference = finalBalance - initalBalance
        const players = await lotteryContract.methods.getPlayers().call()
        expect(players.length).toBe(0)
        expect(web3.utils.toWei(difference, "wei")).toBe(web3.utils.toWei(2, "ether"))
    })
})


