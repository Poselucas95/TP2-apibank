# taller-de-programacion-2
 

# POST /api/clientes/


Body {
 person_id (int32) : 0
 salary (double): 0
 name (String) : “String”
 surname (String) : “String”
 address (String) : “String”
 email	(String) : “String”
 password (String) : “String”
}


•	Se valida:
o	que person_id sea un int de 7 a 8 dígitos.
o	que el person_id no se encuentre en la base de datos.
o	que salary sea igual o mayor a 0.
o	que name, surname, address y password no sean vacios.
o	que email sea un email valido.
o	que password sea un String sin espacios con longitud de entre 4 y 10 caracteres



# GET /api/clientes/{person_id}

o	Ejemplo response:
{
 "client_id": int32,
    "person_id": int32, // dni consultado
    "salary": Double, 
    "name": "String", 
    "surname": "String",
    "address": "String",
    "email": "String",
    "password": "String",
    "accounts": Array[Objetos] // Array con los numeros de cuenta del cliente
}


# PUT /api/clientes/{person_id}

Body {
 salary (double): 0
 address (String) : “String”
 email	(String) : “String”
 password (String) : “String”
}

•	Se valida:
o	que el id corresponda a un cliente en la base de datos.
o	salary: si llego el dato validar que sea igual o mayor a 0.
o	que address y password no sean vacios.
o	que email sea valido.
o	que password sea un String sin espacios y tenga longitud de entre 4 y 10 caracteres.


# DELETE /api/clientes/{person_id}

•	Case: si el person_id corresponde a un cliente y todas las cuentas del cliente tienen balance cero:
o	Se borran las cuentas del cliente de la colección Cuentas 
o	Se borra el cliente de la coleecion Clientes.
