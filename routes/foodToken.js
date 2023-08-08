const router = require("express").Router();
const foodUserModel = require("../models/foodUser.js");
const TokenModel = require("../models/Token.js");

router.get("/", async (req, res) => {
    res.send("Food Token Backend")
})

router.post("/create", async (req, res) => {
    const employeeId = req.body.employeeId;
    const user = await foodUserModel.findOne({ employeeId });
    if (user) {
        return res.status(404).json({ message: 'Employee with this ID Already exists' });
    }

    const newUser = new foodUserModel({
        employeeId: req.body.employeeId,
        employeeName: req.body.employeeName,
    });

    try {
        const savedUser = await newUser.save();
        res.status(200).json({ message: `Emolyee Added Successfully` });
    } catch (err) {
        res.status(500).json({ message: 'Failed to Add Employee' });
    }
})



router.get('/getUsers', async (req, res) => {
    try {
        const users = await foodUserModel.find();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

router.get('/getToken', async (req, res) => {
    try {
        const token = await TokenModel.find();
        res.json(token);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});


router.delete('/deleteUser/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        // Check if the user exists
        const user = await foodUserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete the user
        await foodUserModel.findByIdAndDelete(userId);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Failed to Delete' });
    }
});

router.post('/token', async (req, res) => {
    try {
        const employeeId = req.body.employeeId;
        const user = await foodUserModel.findOne({ employeeId });
        if (!user) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Check if the employee already has a token for the day
        const existingToken = await TokenModel.findOne({
            employeeId,
            createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }, // Check tokens created today
        });

        if (existingToken) {
            return res.status(400).json({ message: 'Employee has already received a token today' });
        }

        // Generate a new token
        const newToken = new TokenModel({
            employeeId,
            createdAt: new Date(),
        });

        // Save the token to the database
        await newToken.save();

        // Return the generated token in the response
        res.status(200).json({ employeeId: user.employeeId, employeeName: user.employeeName });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to generate token' });
    }
});

router.get('/getStats', async (req, res) => {
    try {

        const pipeline = [
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: {
                    '_id.month': 1,
                },
            },
            {
                $project: {
                    _id: 0,
                    month: {
                        $concat: [
                            {
                                $let: {
                                    vars: {
                                        monthsInString: [
                                            '',
                                            'January',
                                            'February',
                                            'March',
                                            'April',
                                            'May',
                                            'June',
                                            'July',
                                            'August',
                                            'September',
                                            'October',
                                            'November',
                                            'December'
                                        ]
                                    },
                                    in: { $arrayElemAt: ['$$monthsInString', '$_id.month'] }
                                }
                            },
                        ],
                    },
                    count: 1,
                },
            },
        ];

        const result = await TokenModel.aggregate(pipeline);

        res.status(200).json(result);
    } catch (error) {
        console.error('Failed to retrieve token counts by month', error);
    }
});

module.exports = router;