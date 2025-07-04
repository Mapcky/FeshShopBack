const models = require('../models')


exports.setNewAddress = async (req, res) => {

    const userId = req.userId

    const { street, city, state, country, zip, isDefault } = req.body

    const transaction = await models.Address.sequelize.transaction()

    try {

        if (isDefault) {
            await models.Address.update(
                { isDefault: false },
                { where: { user_id: userId }, transaction: transaction }
            )
        }


        const newAddress = await models.Address.create({
            street: street,
            city: city,
            state: state,
            country: country,
            zip: zip,
            user_id: userId,
            isDefault
        }, { transaction: transaction })

        await transaction.commit()

        res.status(201).json({ message: "Address created successfully", success: true, address: newAddress })

    } catch (error) {
        await transaction.rollback()
        console.error(error)
        res.status(500).json({ message: "Internal server error.", success: false })
    }

}



exports.getAddresses = async (req, res) => {

    const userId = req.userId

    try {

        const userAddresses = await models.Address.findAll({
            where: {
                user_id: userId
            },
            attributes: ['id', 'street', 'city', 'state', 'country', 'zip', 'isDefault']
        })

        if (userAddresses.length === 0) {
            return res.status(404).json({ message: "No addresses found for this user.", success: false })
        }

        res.status(200).json({ addresses: userAddresses, success: true })



    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal server error.", success: false })
    }
}


exports.changeDefaultAddress = async (req, res) => {

    const { addressId } = req.body

    const transaction = await models.Address.sequelize.transaction()

    try {

        await models.Address.update(
            { isDefault: false },
            { where: { user_id: req.userId }, transaction: transaction }
        )

        const [updatedRows] = await models.Address.update(
            { isDefault: true },
            { where: { user_id: req.userId, id: addressId }, transaction }
        )

        if (updatedRows === 0) {
            throw new Error("No matching address found or user unauthorized")
        }


        await transaction.commit()

        res.status(200).json({ message: "Default Address Updated Succesfully", success: true })


    } catch (error) {
        await transaction.rollback()
        console.error(error)
        res.status(500).json({ message: "Internal server error.", success: false })
    }
}