const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/collection/images", express.static("collection/images"));

app.get("/users/:id", async (req, res) => {
    try {
        const user = await getUser({ id: req.params.id });
        if(!user) {
            res.sendStatus(404);
            return;
        }
        const data = {
            surname: user.surname,
            name: user.name
        };
        if(req.query.password) {
            if(req.query.password === user.password) {
                data.telephone = user.telephone;
                data.email = user.email;
            }
            else {
                res.sendStatus(403);
                return;
            }
        }
        res.json(data);
    }
    catch(e) {
        console.log(e);
        res.sendStatus(500);
    }
});

app.post("/users/create", async (req, res) => {
    try {
        let occupiedTelephone = false, occupiedEmail = false;
        let user = await getUser({ telephone: req.body.telephone });
        if(user)
            occupiedTelephone = true;
        user = await getUser({ email: req.body.email });
        if(user)
            occupiedEmail = true;
        if(!occupiedTelephone && !occupiedEmail) {
            res.json({ userid: await registerUser(req.body) });
        }
        else {
            res.status(403).json({ occupiedTelephone, occupiedEmail });
        }
    }
    catch(e) {
        console.log(e);
        res.sendStatus(500);
    }
});

app.post("/users/login", async (req, res) => {
    try {
        let user = await getUser({
            [Op.or]: [
                { telephone: req.body.login },
                { email: req.body.login }
            ],
            password: req.body.password
        });
        if(user) {
            res.json({ userid: user.id });
        }
        else
            res.sendStatus(403);
    }
    catch(e) {
        console.log(e);
        res.sendStatus(500);
    }
});

app.get("/collection", async (req, res) => {
    try {
        const options = {
            raw: true,
            order: [
                ["id", "DESC"]
            ]
        };
        if(req.query.sort !== "new")
            options.order.unshift([Sequelize.literal("price * sold"), "DESC"])
        if(req.query.limit)
            options.limit = req.query.limit;
        if(req.query.text)
            options.where = {
                name: { [Op.iLike]: `%${req.query.text}%` }
            }
        res.json(await getProducts(options, req.query.category));
    }
    catch(e) {
        console.log(e);
        res.sendStatus(500);
    }
});

app.get("/collection/categories", async (req, res) => {
    try {
        Category.sync();
        const categories = await Category.findAll({
            raw: true,
            hierarchy: true
        });
        res.json(categories);
    }
    catch(e) {
        console.log(e);
        res.sendStatus(500);
    }
});

app.get("/collection/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if(isNaN(id)) {
            res.sendStatus(400);
            return;
        }
        await Collection.sync();
        const product = await Collection.findOne({
            raw: true,
            where: { id: req.params.id }
        });
        res.json(product);
    }
    catch(e) {
        console.log(e);
        res.sendStatus(500);
    }
});

app.listen(8080);

const Sequelize = require("sequelize-hierarchy-next")();
const Op = Sequelize.Op;
const sequelize = new Sequelize("postgres://postgres:1@localhost:5432/online-store", {
    dialect: "postgres",
    define: {
        timestamps: false
    }
});

const Users = sequelize.define("users", {
    surname: {
        type: Sequelize.STRING,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    telephone: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
});
const Collection = sequelize.define("collection", {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    categoryId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    image: {
        type: Sequelize.STRING,
        allowNull: false
    },
    price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
    },
    count: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false
    },
    sold: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
    }
});
const Category = sequelize.define("category", {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    refName: {
        type: Sequelize.STRING,
        allowNull: false
    }
});
Category.isHierarchy();
Category.hasMany(Collection, {
    foreignKey: "categoryId"
});
Collection.belongsTo(Category);

async function registerUser(params) {
    await Users.sync();
    const user = await Users.create({
        id: params.id,
        surname: params.surname,
        name: params.name,
        telephone: params.telephone,
        email: params.email,
        password: params.password
    });
    return user.id;
}

async function getUser(params) {
    await Users.sync();
    return await Users.findOne({ raw: true, where: params });
}

async function getProducts(options, category = undefined) {
    if(category) {
        const refs = category.replace(/\/$/, "").split("/");
        if(refs.length < 1)
            return [];

        let categoryOptions = {
            where: {
                parentId: null,
                refName: refs[0]
            }
        };
        refs.shift();
        
        for(const ref of refs) {
            categoryOptions.model = Category;
            categoryOptions.as = "parent";
            categoryOptions.attributes = [];
            categoryOptions = {
                where: {
                    refName: ref
                },
                include: categoryOptions
            }
        }

        categoryOptions.raw = true;
        categoryOptions.attributes = ["id"];

        const row = await Category.findOne(categoryOptions);
        if(!row)
            return [];
        options.where = {
            [Op.or]: [
                { categoryId: row.id },
                { '$category.id$': { [Op.ne]: null } }
            ]
        };
        options.include = {
            model: Category,
            attributes: [],
            include: {
                model: Category,
                as: "ancestors",
                attributes: [],
                where: { id: row.id },
                through: {
                    attributes: []
                }
            }
        };
    }
    
    await Collection.sync();
    return await Collection.findAll(options);
}
/*
async function fn() {
    await Category.sync({ force: true });
    await sequelize.models.categoryancestor.sync({ force: true });
    await Collection.sync({ force: true });
    {
        const id = (await Category.create({
            name: "Девочкам",
            refName: "devochkam"
        })).id;
        {
            const id2 = (await Category.create({
                name: "Одежда",
                refName: "odezhda",
                parentId: id
            })).id;
            await Category.create({
                name: "Платья",
                refName: "platya",
                parentId: id2
            });
            await Category.create({
                name: "Костюмы",
                refName: "kostumy",
                parentId: id2
            });
            await Category.create({
                name: "Джинсы",
                refName: "jeansy",
                parentId: id2
            });
        }
        {
            const id2 = (await Category.create({
                name: "Верхняя одежда",
                refName: "verhnyaya-odezhda",
                parentId: id
            })).id;
            const id3 = (await Category.create({
                name: "Куртки",
                refName: "kurtki",
                parentId: id2
            })).id;
            await Collection.create({
                name: "Куртка из материала Softshell",
                categoryId: id3,
                image: "product1.jpg",
                price: 2999
            });
            await Collection.create({
                name: "Куртка объёмная с капюшоном",
                categoryId: id3,
                image: "product2.jpg",
                price: 3999,
                sold: 1
            });
            await Collection.create({
                name: "Куртка Hippasilla Розовая",
                categoryId: id3,
                image: "product3.jpg",
                price: 4999
            });
            await Category.create({
                name: "Комбинезоны",
                refName: "kombinezony",
                parentId: id2
            });
        }
    }
    {
        const id = (await Category.create({
            name: "Мальчикам",
            refName: "malchikam"
        })).id;
        {
            const id2 = (await Category.create({
                name: "Одежда",
                refName: "odezhda",
                parentId: id
            })).id;
            await Category.create({
                name: "Брюки",
                refName: "bruki",
                parentId: id2
            });
            await Category.create({
                name: "Костюмы",
                refName: "kostumy",
                parentId: id2
            });
            await Category.create({
                name: "Джинсы",
                refName: "jeansy",
                parentId: id2
            });
        }
        {
            const id2 = (await Category.create({
                name: "Верхняя одежда",
                refName: "verhnyaya-odezhda",
                parentId: id
            })).id;
            const id3 = (await Category.create({
                name: "Куртки",
                refName: "kurtki",
                parentId: id2
            })).id;
            await Collection.create({
                name: "Легкая куртка для мальчиков Kappa",
                categoryId: id3,
                image: "product4.jpg",
                price: 5999
            })
            await Category.create({
                name: "Комбинезоны",
                refName: "kombinezony",
                parentId: id2
            });
        }
    }
    // console.log(await Collection.findAll({
    //     raw: true,
    //     where: {
    //         [Op.or]: [
    //             { categoryId: 6 },
    //             { '$category.ancestors.categoryancestor.ancestorId$': 6 }
    //         ]
    //     },
    //     include: {
    //         model: Category,
    //         attributes: [],
    //         include: {
    //             model: Category,
    //             as: "ancestors",
    //             attributes: [],
    //             where: { id: 6 }
    //         }
    //     }
    // }));
    // console.log(await Category.findAll({
    //     raw: true,
    //     include: {
    //         model: Category,
    //         as: "parent",
    //         where: { id: 1 }
    //     }
    // }))
    // console.log(await getProducts({ raw: true }, "devochkam/verhnyaya-odezhda"));
}
fn();
*/