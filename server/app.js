const express = require("express");
const cors = require("cors");
const app = express();
const port = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/products/images", express.static("products/images"));

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
        if(req.body.password.length < 8) {
            res.status(403).send("Пароль должен быть не менее 8 символов");
            return;
        }
        let occupiedTelephone = false, occupiedEmail = false;
        let user = await getUser({ telephone: req.body.telephone });
        if(user)
            occupiedTelephone = true;
        user = await getUser({ email: req.body.email });
        if(user)
            occupiedEmail = true;
        if(!occupiedTelephone && !occupiedEmail) {
            await User.sync();
            const newuser = await User.create({
                id: req.body.id,
                surname: req.body.surname,
                name: req.body.name,
                telephone: req.body.telephone,
                email: req.body.email,
                password: req.body.password
            });
            res.json({ userid: newuser.id });
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

app.get("/products", async (req, res) => {
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

app.get("/products/categories", async (req, res) => {
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

app.get("/products/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if(isNaN(id)) {
            res.sendStatus(400);
            return;
        }
        await Product.sync();
        const product = await Product.findOne({
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

app.listen(port, () => console.log(`Listening on port ${port}`));

const Sequelize = require("sequelize-hierarchy-next")();
const Op = Sequelize.Op;
const sequelize = new Sequelize("postgres://postgres:1@localhost:5432/online-store", {
    dialect: "postgres",
    define: {
        timestamps: false
    }
});

const User = sequelize.define("user", {
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
const Product = sequelize.define("product", {
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
Category.hasMany(Product, {
    foreignKey: "categoryId"
});
Product.belongsTo(Category);

async function getUser(params) {
    await User.sync();
    return await User.findOne({ raw: true, where: params });
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
    
    await Product.sync();
    return await Product.findAll(options);
}
/*
async function fn() {
    await Category.sync({ force: true });
    await sequelize.models.categoryancestor.sync({ force: true });
    await Product.sync({ force: true });
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
            await Product.create({
                name: "Куртка из материала Softshell",
                categoryId: id3,
                image: "product1.jpg",
                price: 2999
            });
            await Product.create({
                name: "Куртка объёмная с капюшоном",
                categoryId: id3,
                image: "product2.jpg",
                price: 3999,
                sold: 1
            });
            await Product.create({
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
            await Product.create({
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
    // console.log(await Product.findAll({
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