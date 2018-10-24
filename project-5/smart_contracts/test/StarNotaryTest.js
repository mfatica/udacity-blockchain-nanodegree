const StarNotary = artifacts.require('StarNotary');

contract('StarNotary', accounts => {

    let starInput = {
        name: "awesome star!",
        story: "I love my star!",
        dec: "ra_032.155",
        mag: "dec_121.874",
        cent: "mag_245.978"
    };

    beforeEach(async function () {
        this.contract = await StarNotary.new({ from: accounts[0] })
    })

    describe('can create a star', () => {

        beforeEach(async function () {
            await this.contract.createStar(
                starInput.name,
                starInput.story,
                starInput.dec,
                starInput.mag,
                starInput.cent,
                1, { from: accounts[0] })
        })

        it('can create a star and get its name', async function () {
            var registeredStar = await this.contract.tokenIdToStarInfo(1);

            assert.equal(registeredStar[0], starInput.name);
            assert.equal(registeredStar[1], starInput.story);
            assert.equal(registeredStar[2], starInput.dec);
            assert.equal(registeredStar[3], starInput.mag);
            assert.equal(registeredStar[4], starInput.cent);
        })

        it('won\'t create a star that\'s been claimed', async function () {
            try {
                await this.contract.createStar(
                    'not the same star!',
                    'totally a different star',
                    starInput.dec,
                    starInput.mag,
                    starInput.cent,
                    2, { from: accounts[0] });
            }
            catch (e) {
                assert.isTrue(e.message.includes("revert"));
            }
        })

        it('won\'t create a star with existing tokenid', async function () {
            this.contract.createStar(
                'not the same star!',
                'totally a different star',
                "ra_055.155",
                "dec_133.874",
                "mag_222.978",
                1, { from: accounts[0] })
                .then(() => { })
                .catch((error) => assert.isNotNull(error));
        })
    })

    describe('buying and selling stars', () => {
        let user1 = accounts[0]
        let user2 = accounts[1]
        let randomMaliciousUser = accounts[3]

        let starId = 1
        let starPrice = web3.toWei(.01, "ether")

        beforeEach(async function () {
            await this.contract.createStar(
                starInput.name,
                starInput.story,
                starInput.dec,
                starInput.mag,
                starInput.cent,
                starId,
                { from: user1 })
        })

        it('user1 can put up their star for sale', async function () {
            assert.equal(await this.contract.ownerOf(starId), user1)
            await this.contract.putStarUpForSale(starId, starPrice, { from: user1 })

            assert.equal(await this.contract.starsForSale(starId), starPrice)
        })

        describe('user2 can buy a star that was put up for sale', () => {
            beforeEach(async function () {
                await this.contract.putStarUpForSale(starId, starPrice, { from: user1 })
            })

            it('user2 is the owner of the star after they buy it', async function () {
                await this.contract.buyStar(starId, { from: user2, value: starPrice, gasPrice: 0 })
                assert.equal(await this.contract.ownerOf(starId), user2)
            })

            it('user2 ether balance changed correctly', async function () {
                let overpaidAmount = web3.toWei(.05, 'ether')
                const balanceBeforeTransaction = web3.eth.getBalance(user2)
                await this.contract.buyStar(starId, { from: user2, value: overpaidAmount, gasPrice: 0 })
                const balanceAfterTransaction = web3.eth.getBalance(user2)

                assert.equal(balanceBeforeTransaction.sub(balanceAfterTransaction), starPrice)
            })
        })
    })

    describe('checking if star exists', () => {
        let user1 = accounts[1]

        beforeEach(async function () {
            await this.contract.createStar(
                starInput.name,
                starInput.story,
                starInput.dec,
                starInput.mag,
                starInput.cent,
                1,
                { from: user1 })
        })

        it('existing star returns true', async function () {
            assert.isTrue(await this.contract.checkIfStarExist(starInput.dec, starInput.mag, starInput.cent));
        });

        it('non-existing star returns false', async function () {
            assert.isFalse(await this.contract.checkIfStarExist("ra_055.155", "dec_133.874", "mag_222.978"));
        });
    })

    describe('transferring stars', () => {
        let user1 = accounts[0];
        let user2 = accounts[1];
        let user3 = accounts[2];

        beforeEach(async function () {
            await this.contract.createStar(
                starInput.name,
                starInput.story,
                starInput.dec,
                starInput.mag,
                starInput.cent,
                1,
                { from: user1 })
        })

        it('getApproved returns 0 for unapproved', async function () {
            assert.equal(await this.contract.getApproved(1), 0);
        });

        it('user1 can approve transfer of star', async function () {
            await this.contract.approve(user2, 1);
            assert.equal(await this.contract.getApproved(1), user2);
        });

        it('user can\'t self-transfer star', async function () {
            try {
                await this.contract.approve(user1, 1);
            }
            catch (e) {
                assert.isTrue(e.message.includes("revert"));
            }
        })

        it('user can\'t transfer someone else\'s star', async function () {
            await this.contract.createStar(
                starInput.name,
                starInput.story,
                starInput.dec,
                starInput.mag,
                starInput.cent,
                3,
                { from: user3 })

            try {
                await this.contract.approve(user1, 1);
            }
            catch (e) {
                assert.isTrue(e.message.includes("revert"));
            }
        })

        it('user1 can transfer with safeTransformFrom', async function () {
            let result = await this.contract.safeTransferFrom(user1, user2, 1);
            assert.isNotNull(result.tx);
        });

        it('can not transfer someone else\'s star with safeTransformFrom', async function () {
            try {
                await this.contract.safeTransferFrom(user2, user3, 1);
            }
            catch (e) {
                assert.isTrue(e.message.includes("revert"));
            }
        });
    });


    describe('star approvals', () => {
        let user1 = accounts[0];
        let user2 = accounts[1];
        let user3 = accounts[2];

        beforeEach(async function () {
            await this.contract.createStar(
                starInput.name,
                starInput.story,
                starInput.dec,
                starInput.mag,
                starInput.cent,
                1,
                { from: user1 })
        })

        it('user1 can set approval of own stars', async function () {
            await this.contract.setApprovalForAll(user2, true);
            assert.isTrue(await this.contract.isApprovedForAll(user1, user2));
        });

        it('user1 can unset approval of own stars', async function () {
            await this.contract.setApprovalForAll(user2, true);
            await this.contract.setApprovalForAll(user2, false);
            assert.isFalse(await this.contract.isApprovedForAll(user1, user2));
        });

        it('user1 can not approve self transfer', async function () {
            try {
                await this.contract.setApprovalForAll(user1, true);
            }
            catch (e) {
                assert.isTrue(e.message.includes("revert"));
            }
        });
    });

    describe('ownerOf', () => {
        let user1 = accounts[0];
        let user2 = accounts[1];

        beforeEach(async function () {
            await this.contract.createStar(
                starInput.name,
                starInput.story,
                starInput.dec,
                starInput.mag,
                starInput.cent,
                1,
                { from: user1 });
        })

        it('user1 owns star', async function () {
            assert.equal(await this.contract.ownerOf(1), user1)
        })

        it('user2 owns star after transfer', async function () {
            await this.contract.safeTransferFrom(user1, user2, 1);
            assert.equal(await this.contract.ownerOf(1), user2);
        })
    });
})